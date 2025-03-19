// Basic interface for multilingual content
export interface MultilingualContent {
  en?: string;
  fr?: string;
  ar?: string;
  el?: string;
  he?: string;
  it?: string;
  de?: string;
  [key: string]: string | undefined;
}

// New interfaces for DCAPv2
export interface DCLanguageValue {
  "@language": string;
  "@value": string;
}

export interface DCConcept {
  "@id": string;
  "@type": string;
  "prefLabel": MultilingualContent;
}

export interface DCAgent {
  "@id": string;
  "@type": string;
  "prefLabel": MultilingualContent;
}

// DCAPv2 Cultural Heritage Object data structure
export interface DCAPv2Data {
  "@context": string;
  "@type": string[];
  "dc:subject"?: Array<DCConcept | DCLanguageValue>;
  "dc:title"?: MultilingualContent;
  "dc:type"?: Array<DCConcept | DCLanguageValue>;
  "dc:creator"?: Array<DCAgent | DCLanguageValue>;
  "dc:date"?: string[];
  "dc:description"?: MultilingualContent | DCLanguageValue[];
  "dc:identifier"?: string[];
  "dc:language"?: string[];
  "dc:source"?: DCLanguageValue[];
  "dcterms:created"?: string[];
  "dcterms:spatial"?: DCLanguageValue[];
  "dcterms:isPartOf"?: DCLanguageValue[];
  "edm:type"?: string;
}

// The actual structure of the TAR (Tokenized Asset Record)
export interface TAR {
  id?: string;             
  receipt?: string;      
  userAddress?: string | null;
  data: DCAPv2Data;
  checksum?: string;          
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
