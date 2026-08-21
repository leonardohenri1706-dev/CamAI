// src/hooks/useLeadEnricher.ts
import { useState, useCallback } from 'react';

export function useLeadEnricher() {
  const [loading, setLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [enrichedLeads, setEnrichedLeads] = useState<any[]>([]);

  const startEnrichment = useCallback(async (rawLeads: any[]) => {
    if (!rawLeads || rawLeads.length === 0) return [];
    setLoading(true);
    setProgressStatus('Iniciando fila no servidor...');

    try {
      // 1. Despacha a task para o Django backend (ou fallback Next.js)
      let task_id: string | null = null;
      let directResults: any[] | null = null;

      try {
        const startRes = await fetch('http://127.0.0.1:8000/api/django/leads/enrich/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: rawLeads }),
        });
        const data = await startRes.json();
        task_id = data.task_id;
        if (data.status === 'SUCCESS' && data.result?.leads) {
          directResults = data.result.leads;
        }
      } catch {
        // Fallback direto via Next.js
        directResults = rawLeads;
      }

      if (directResults) {
        setEnrichedLeads(directResults);
        setLoading(false);
        setProgressStatus('Finalizado!');
        return directResults;
      }

      if (!task_id) {
        setLoading(false);
        return rawLeads;
      }

      // 2. Inicia o polling de verificação a cada 1.5s
      return new Promise<any[]>((resolve) => {
        const pollInterval = setInterval(async () => {
          try {
            const pollRes = await fetch(`http://127.0.0.1:8000/api/django/leads/task/${task_id}/`);
            const data = await pollRes.json();

            if (data.state === 'PROGRESS') {
              setProgressStatus(data.status || 'Processando sites e contatos...');
            } else if (data.state === 'SUCCESS') {
              clearInterval(pollInterval);
              const leads = data.result?.leads || rawLeads;
              setEnrichedLeads(leads);
              setLoading(false);
              setProgressStatus('Finalizado!');
              resolve(leads);
            } else if (data.state === 'FAILURE') {
              clearInterval(pollInterval);
              setLoading(false);
              setProgressStatus('Erro no processamento.');
              resolve(rawLeads);
            }
          } catch {
            clearInterval(pollInterval);
            setLoading(false);
            setProgressStatus('Finalizado (fallback)');
            resolve(rawLeads);
          }
        }, 1500);
      });
    } catch {
      setLoading(false);
      setProgressStatus('Falha ao se conectar com o backend.');
      return rawLeads;
    }
  }, []);

  return { startEnrichment, loading, progressStatus, enrichedLeads };
}
