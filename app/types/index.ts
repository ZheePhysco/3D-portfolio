export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: PhotoCategory;
  width?: number;
  height?: number;
}

export type PhotoCategory = "portrait" | "street" | "analog" | "gallery";

export interface GallerySection {
  title: string;
  description: string;
  photos: Photo[];
}

export interface PhotographerInfo {
  name: string;
  tagline: string;
  bio: string;
  location: string;
  gear: string[];
}
