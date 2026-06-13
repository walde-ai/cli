export interface BriefListItem {
  id: string;
  projectId: string;
  title: string;
  state: string;
  createdAt: string;
}

export interface BriefDetail {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  state: string;
  sections: Record<string, string>;
  comments: Array<{ author: { name: string }; content: string; timestamp: string }>;
  createdAt: string;
  updatedAt?: string;
}

export interface BriefEventItem {
  id: string;
  briefId: string;
  timestamp: string;
  type: string;
  author: { name: string };
  payload: Record<string, any>;
}

export interface IBriefPresenter {
  requestBriefTitle(): Promise<string>;
  requestIntent(): Promise<string>;
  requestProjectId(): Promise<string>;
  requestSectionContent(sectionLabel: string): Promise<string>;
  requestSectionSelection(modifiableSectionKeys: string[]): Promise<string>;
  requestSectionInputMode(): Promise<'file' | 'inline'>;
  requestSectionFilePath(): Promise<string>;
  requestContinue(): Promise<boolean>;
  
  presentBriefCreated(brief: BriefDetail): void;
  presentBriefUpdated(brief: BriefDetail): void;
  presentBriefDetail(brief: BriefDetail): void;
  presentBriefs(briefs: BriefListItem[]): void;
  presentEvents(events: BriefEventItem[]): void;
  
  startOperation(message: string): void;
  stopOperation(): void;
  
  showError(message: string): void;
}
