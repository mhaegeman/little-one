export type AulaConnectionRequest = {
  childId: string;
  institutionId: string;
  username?: string;
};

export type AulaSyncResult = {
  imported: number;
  skipped: number;
  message: string;
};

export async function syncAulaHighlights(): Promise<AulaSyncResult> {
  // Aula parent access is MitID-based. Keep this function as an integration
  // boundary until an approved API/token handoff is available for production.
  return {
    imported: 0,
    skipped: 0,
    message:
      "Aula sync is configured as a safe placeholder. Add an approved Aula integration before importing family data."
  };
}
