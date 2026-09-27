export interface ServiceModel {
  id: string;
  name: string;              // "Poli Umum"
  code: string;              // "A"
  isActive: boolean;
  currentServing: string | null; // current queue number being served
  currentServingQueueId: string | null;
}
