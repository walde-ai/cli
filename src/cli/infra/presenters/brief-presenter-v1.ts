import Table from 'cli-table3';
import {
  IBriefPresenter,
  BriefListItem,
  BriefDetail,
  BriefEventItem,
} from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';
import { sectionDisplayLabel } from './section-display';

export class BriefPresenterV1 implements IBriefPresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly prompt: IPromptComponent,
    private readonly config: PresenterConfig
  ) {}

  public async requestBriefTitle(): Promise<string> {
    return this.prompt.text('Brief title:');
  }

  public async requestIntent(): Promise<string> {
    return this.prompt.text('Intent:');
  }

  public async requestProjectId(): Promise<string> {
    return this.prompt.text('Project ID:');
  }

  public async requestSectionContent(sectionLabel: string): Promise<string> {
    return this.prompt.text(`${sectionLabel} content:`);
  }

  public async requestSectionSelection(modifiableSectionKeys: string[]): Promise<string> {
    const choices = modifiableSectionKeys.map((key) => ({
      name: sectionDisplayLabel(key),
      value: key,
    }));
    return this.prompt.select('Select a section:', choices);
  }

  public async requestSectionInputMode(): Promise<'file' | 'inline'> {
    const value = await this.prompt.select('How would you like to provide the section content?', [
      { name: 'Inline text', value: 'inline' },
      { name: 'File path', value: 'file' },
    ]);
    return value as 'file' | 'inline';
  }

  public async requestSectionFilePath(): Promise<string> {
    return this.prompt.text('File path:');
  }

  public async requestContinue(): Promise<boolean> {
    return this.prompt.confirm('Set another section?', false);
  }

  public presentBriefCreated(brief: BriefDetail): void {
    console.log();
    console.log(CliTheme.accent(`✓ Brief created: ${brief.title} (${brief.id})`));
    console.log();
    console.log(CliTheme.soft(`State: ${brief.state}`));
  }

  public presentBriefUpdated(brief: BriefDetail): void {
    console.log();
    console.log(CliTheme.accent(`✓ Brief updated: ${brief.title} (${brief.id})`));
    console.log();
    console.log(CliTheme.soft(`State: ${brief.state}`));
  }

  public presentBriefDetail(brief: BriefDetail): void {
    console.log();
    console.log(CliTheme.accent(`Brief: ${brief.title}`));
    console.log();
    console.log(`ID:        ${brief.id}`);
    console.log(`Project:   ${brief.projectId}`);
    console.log(`State:     ${brief.state}`);
    console.log(`Created:   ${brief.createdAt}`);
    if (brief.updatedAt) {
      console.log(`Updated:   ${brief.updatedAt}`);
    }
    
    if (Object.keys(brief.sections).length > 0) {
      console.log();
      console.log(CliTheme.accent('Sections:'));
      for (const [key, value] of Object.entries(brief.sections)) {
        console.log();
        console.log(CliTheme.soft(`--- ${sectionDisplayLabel(key)} ---`));
        console.log(value);
      }
    }

    if (brief.comments.length > 0) {
      console.log();
      console.log(CliTheme.accent('Comments:'));
      for (const comment of brief.comments) {
        console.log();
        console.log(CliTheme.soft(`[${comment.timestamp}] ${comment.author.name}:`));
        console.log(comment.content);
      }
    }
  }

  public presentBriefs(briefs: BriefListItem[]): void {
    if (briefs.length === 0) {
      console.log(CliTheme.soft('No briefs found.'));
      return;
    }

    const table = new Table({
      head: [
        CliTheme.accent('ID'),
        CliTheme.accent('Title'),
        CliTheme.accent('State'),
        CliTheme.accent('Project'),
        CliTheme.accent('Created'),
      ],
      style: { head: [], border: [], 'padding-left': 0, 'padding-right': 2 },
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      }
    });

    for (const b of briefs) {
      table.push([b.id, b.title, b.state, b.projectId, b.createdAt]);
    }

    console.log(table.toString());
  }

  public presentEvents(events: BriefEventItem[]): void {
    if (events.length === 0) {
      console.log(CliTheme.soft('No events found.'));
      return;
    }

    console.log();
    for (const event of events) {
      console.log(CliTheme.accent(`[${event.timestamp}] ${event.type} by ${event.author.name}`));
      console.log(JSON.stringify(event.payload, null, 2));
      console.log();
    }
  }

  public startOperation(message: string): void {
    this.spinner.start(message);
  }

  public stopOperation(): void {
    this.spinner.stop();
  }

  public showError(message: string): void {
    console.error(CliTheme.error(`✗ Error: ${message}`));
  }
}
