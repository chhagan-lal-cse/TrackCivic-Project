import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | TrackCivic` : 'TrackCivic — Civic Issue Management';
  }, [title]);
}
