import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';

/**
 * Default presenter configuration.
 * Colors follow the Walde CLI theme: forest green (accent), dark red (error), dark gray (info).
 */
export const DefaultPresenterConfig: PresenterConfig = {
  successColor: '#228B22',
  errorColor: '#8B0000',
  infoColor: '#808080'
};
