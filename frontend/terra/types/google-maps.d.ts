declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
    ): void;
  }

  interface GeocoderRequest {
    address?: string;
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    region?: string;
  }

  interface GeocoderResult {
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    geometry: GeocoderGeometry;
    partial_match: boolean;
    place_id: string;
    postcode_localities: string[];
    types: string[];
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface GeocoderGeometry {
    bounds: LatLngBounds;
    location: LatLng;
    location_type: GeocoderLocationType;
    viewport: LatLngBounds;
  }

  enum GeocoderLocationType {
    APPROXIMATE = 'APPROXIMATE',
    GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
    RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
    ROOFTOP = 'ROOFTOP'
  }

  enum GeocoderStatus {
    ERROR = 'ERROR',
    INVALID_REQUEST = 'INVALID_REQUEST',
    OK = 'OK',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    ZERO_RESULTS = 'ZERO_RESULTS'
  }

  interface GeocoderComponentRestrictions {
    administrativeArea?: string;
    country?: string | string[];
    locality?: string;
    postalCode?: string;
    route?: string;
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
    toString(): string;
    toUrlValue(precision?: number): string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    contains(latLng: LatLng): boolean;
    equals(other: LatLngBounds | null): boolean;
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds): boolean;
    isEmpty(): boolean;
    toSpan(): LatLng;
    toString(): string;
    toUrlValue(precision?: number): string;
    union(other: LatLngBounds): LatLngBounds;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  namespace places {
    class PlacesService {
      constructor(attrContainer: HTMLDivElement | Map);
      nearbySearch(
        request: PlaceSearchRequest,
        callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
      ): void;
    }

    interface PlaceSearchRequest {
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      keyword?: string;
      location?: LatLng | LatLngLiteral;
      maxPriceLevel?: number;
      minPriceLevel?: number;
      name?: string;
      openNow?: boolean;
      radius?: number;
      rankBy?: RankBy;
      type?: string;
      types?: string[];
    }

    interface PlaceResult {
      address_components?: GeocoderAddressComponent[];
      adr_address?: string;
      aspects?: PlaceAspectRating[];
      business_status?: BusinessStatus;
      formatted_address?: string;
      formatted_phone_number?: string;
      geometry?: PlaceGeometry;
      html_attributions?: string[];
      icon?: string;
      icon_background_color?: string;
      icon_mask_base_uri?: string;
      international_phone_number?: string;
      name?: string;
      opening_hours?: PlaceOpeningHours;
      permanently_closed?: boolean;
      photos?: PlacePhoto[];
      place_id?: string;
      plus_code?: PlacePlusCode;
      price_level?: number;
      rating?: number;
      reviews?: PlaceReview[];
      types?: string[];
      url?: string;
      user_ratings_total?: number;
      utc_offset_minutes?: number;
      vicinity?: string;
      website?: string;
    }

    interface PlaceGeometry {
      location?: LatLng;
      viewport?: LatLngBounds;
    }

    interface PlaceOpeningHours {
      isOpen(): boolean;
      periods?: PlaceOpeningHoursPeriod[];
      weekday_text?: string[];
    }

    interface PlaceOpeningHoursPeriod {
      close?: PlaceOpeningHoursTime;
      open: PlaceOpeningHoursTime;
    }

    interface PlaceOpeningHoursTime {
      day: number;
      time: string;
    }

    interface PlacePhoto {
      height: number;
      html_attributions: string[];
      width: number;
      getUrl(opts?: PhotoOptions): string;
    }

    interface PhotoOptions {
      maxHeight?: number;
      maxWidth?: number;
    }

    interface PlaceReview {
      aspects?: PlaceAspectRating[];
      author_name: string;
      author_url?: string;
      language: string;
      profile_photo_url?: string;
      rating: number;
      relative_time_description: string;
      text: string;
      time: number;
    }

    interface PlaceAspectRating {
      rating: number;
      type: string;
    }

    interface PlacePlusCode {
      compound_code?: string;
      global_code: string;
    }

    enum PlacesServiceStatus {
      INVALID_REQUEST = 'INVALID_REQUEST',
      NOT_FOUND = 'NOT_FOUND',
      OK = 'OK',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
      ZERO_RESULTS = 'ZERO_RESULTS'
    }

    enum RankBy {
      DISTANCE = 'DISTANCE',
      PROMINENCE = 'PROMINENCE'
    }

    enum BusinessStatus {
      CLOSED_PERMANENTLY = 'CLOSED_PERMANENTLY',
      CLOSED_TEMPORARILY = 'CLOSED_TEMPORARILY',
      OPERATIONAL = 'OPERATIONAL'
    }
  }

  namespace geometry {
    namespace spherical {
      function computeDistanceBetween(
        from: LatLng,
        to: LatLng
      ): number;
    }
  }
}

export {}; 