import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../utils/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, doctor, medicine, timestamp } = body;

    // Validate required fields
    if (!user || !doctor || !medicine) {
      return NextResponse.json(
        { error: 'All fields (user, doctor, medicine) are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('terrahacksDatabase');
    const collection = db.collection('userDetails');

    // Create the document to insert
    const userDetail = {
      user: user.trim(),
      doctor: doctor.trim(),
      medicine: medicine.trim(),
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date()
    };

    // Insert the document
    const result = await collection.insertOne(userDetail);

    return NextResponse.json(
      { 
        success: true, 
        id: result.insertedId,
        message: 'User details saved successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving user details:', error);
    return NextResponse.json(
      { error: 'Failed to save user details' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('terrahacksDatabase');
    const collection = db.collection('userDetails');

    // Fetch all user details, sorted by most recent first
    const userDetails = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100) // Limit to last 100 entries
      .toArray();

    return NextResponse.json(
      { 
        success: true, 
        data: userDetails,
        count: userDetails.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
