import { KnowledgeBaseMatch, KnowledgeBaseFetchResult } from '@walde.ai/sdk';

/**
 * Presenter for the Knowledge Base read-path commands (`walde kb search` and
 * `walde kb fetch`).
 */
export interface IKnowledgeBasePresenter {
  startOperation(message: string): void;
  stopOperation(): void;
  showError(message: string): void;
  presentMatches(matches: KnowledgeBaseMatch[]): void;
  presentFetchResult(result: KnowledgeBaseFetchResult): void;
}
