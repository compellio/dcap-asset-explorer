// Basic interface for multilingual content
export interface MultilingualContent {
    en?: string;
    fr?: string;
    ar?: string;
    [key: string]: string | undefined;
  }
  
  // Real World Asset (RWA) properties
  export interface RWAPhysicalProperties {
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    weight: {
      value: number;
      unit: string;
    };
    materials: string[];
    condition: MultilingualContent;
  }
  
  export interface RWACreation {
    creator: MultilingualContent;
    date: MultilingualContent;
    location: MultilingualContent;
    culture: MultilingualContent;
    technique: MultilingualContent;
  }
  
  export interface RWADiscovery {
    discoverer: MultilingualContent;
    discovery_date: string;
    discovery_location: MultilingualContent;
    discovery_context: MultilingualContent;
  }
  
  export interface RWAConservation {
    status: MultilingualContent;
    special_requirements: MultilingualContent;
    last_assessment: string;
  }
  
  export interface RWA {
    digital_carrier_id: string;
    digital_carrier_type: string;
    rwa_id: string;
    rwa_title: MultilingualContent;
    rwa_kind: MultilingualContent;
    rwa_description: MultilingualContent;
    rwa_current_storage: MultilingualContent;
    rwa_storage_location: MultilingualContent;
    rwa_physical_properties: RWAPhysicalProperties;
    rwa_creation: RWACreation;
    rwa_discovery: RWADiscovery;
    rwa_conservation: RWAConservation;
    rwa_inscriptions: string[];
    rwa_significance: MultilingualContent;
    rwa_keywords: string[];
  }
  
  // Digital Carrier Asset Record (DCAR) properties
  export interface DARDigitalImage {
    url: string;
    type: string;
    caption: MultilingualContent;
  }
  
  export interface DARDigitalRepresentations {
    images: DARDigitalImage[];
  }
  
  export interface DARRights {
    copyright: string;
    license: string;
    attribution: string;
  }
  
  export interface DARReferences {
    bibliography: string[];
    related_objects: string[];
    external_links: string[];
  }
  
  export interface DARMetadata {
    cataloger: string;
    catalog_date: string;
    last_modified: string;
    record_status: string;
  }
  
  export interface DCAR {
    dar_id: string;
    dar_system_id: string;
    dar_url: string;
    dar_description: MultilingualContent;
    dar_registration_date: string;
    dar_institution: MultilingualContent;
    dar_inventory_number: string;
    dar_digital_representations: DARDigitalRepresentations;
    dar_rights: DARRights;
    dar_references: DARReferences;
    dar_metadata: DARMetadata;
  }
  
  // Complete TAR (Tokenized Asset Record) structure
  export interface TARPayload {
    rwa: RWA;
    dcar: DCAR;
  }
  
  // The actual structure of the API response has data with tar_payload nested inside
  export interface TAR {
    id?: string;             
    receipt?: string;      
    userAddress?: string | null;
    data: {
      "@context"?: string;
      tar_payload: TARPayload;
    };
    checksum?: string;          // Checksum for asset verification
    version?: number;       
    _sdHashes?: any[];     
  }
  
  // API Response types
  export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
  }
  
  // Search parameters and results
  export interface SearchParams {
    query: string;
    page?: number;
    limit?: number;
    [key: string]: any;
  }
  
  export interface SearchResult {
    assets: TAR[];
    total: number;
    page: number;
    limit: number;
  }