import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { LinkRecord, LinkService } from './link.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './snip.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  readonly title = 'Link desk';
  readonly links = signal<LinkRecord[]>([]);
  readonly url = signal('');
  readonly createdLink = signal<LinkRecord | null>(null);
  readonly error = signal('');
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);

  constructor(private readonly linkService: LinkService) {}

  ngOnInit(): void {
    this.loadLinks();
  }

  onUrlInput(event: Event): void {
    this.url.set((event.target as HTMLInputElement).value);
  }

  createLink(event: SubmitEvent): void {
    event.preventDefault();
    this.error.set('');
    this.createdLink.set(null);

    let destination: URL;
    try {
      destination = new URL(this.url().trim());
    } catch {
      this.error.set('Enter a valid HTTP or HTTPS URL.');
      return;
    }

    if (destination.protocol !== 'http:' && destination.protocol !== 'https:') {
      this.error.set('Enter a valid HTTP or HTTPS URL.');
      return;
    }

    this.isSubmitting.set(true);
    this.linkService.createLink(destination.href).subscribe({
      next: (link) => {
        this.createdLink.set(link);
        this.url.set('');
        this.isSubmitting.set(false);
        this.loadLinks();
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
        this.isSubmitting.set(false);
      },
    });
  }

  private loadLinks(): void {
    this.isLoading.set(true);
    this.linkService.listLinks().subscribe({
      next: (links) => {
        this.links.set(links);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Could not reach the Snip API at localhost:3000.';
      }

      const responseError = (error.error as { error?: unknown } | null)?.error;
      if (typeof responseError === 'string') return responseError;
    }

    return 'The request could not be completed. Please try again.';
  }
}
