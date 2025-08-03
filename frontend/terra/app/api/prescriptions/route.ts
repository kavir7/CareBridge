import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../utils/mongodb';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_name, doctor, medication, instructions, full_text, sessionId } = body;

    // Validate required fields
    if (!patient_name && !doctor && !medication) {
      return NextResponse.json(
        { error: 'At least one of patient_name, doctor, or medication is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('terrahacksDatabase');
    const collection = db.collection('prescriptions');

    // Create a hash of the prescription content to check for duplicates
    const contentHash = crypto.createHash('md5')
      .update(`${patient_name || ''}${doctor || ''}${medication || ''}${instructions || ''}`)
      .digest('hex');

    // Check for existing prescription with same content hash
    const existingPrescription = await collection.findOne({ contentHash });
    
    if (existingPrescription) {
      return NextResponse.json(
        { 
          message: 'Prescription already exists in database',
          isDuplicate: true,
          existingId: existingPrescription._id,
          existingData: existingPrescription
        },
        { status: 200 }
      );
    }

    // Create the document to insert
    const prescriptionData = {
      patient_name: patient_name || 'Not found',
      doctor: doctor || 'Not found',
      medication: medication || 'Not found',
      instructions: instructions || 'Not found',
      full_text: full_text || '',
      sessionId: sessionId || null,
      contentHash,
      uploadedAt: new Date(),
      createdAt: new Date()
    };

    // Insert the document
    const result = await collection.insertOne(prescriptionData);

    return NextResponse.json(
      { 
        success: true, 
        id: result.insertedId,
        message: 'Prescription data saved successfully',
        isDuplicate: false,
        data: prescriptionData
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving prescription data:', error);
    return NextResponse.json(
      { error: 'Failed to save prescription data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('terrahacksDatabase');
    const collection = db.collection('prescriptions');

    let query = {};
    if (sessionId) {
      query = { sessionId };
    }

    // Fetch prescriptions, sorted by most recent first
    const prescriptions = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(
      { 
        success: true, 
        data: prescriptions,
        count: prescriptions.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching prescription data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescription data' },
      { status: 500 }
    );
  }
}
