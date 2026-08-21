# backend/prospector/tasks.py
import asyncio
from celery import shared_task
from .engine.batch_crawler import enrich_leads_batch
from .engine.phone_verifier import verify_and_format_real_whatsapp

@shared_task(bind=True)
def process_leads_task(self, raw_leads: list):
    """
    Recebe os leads brutos do Google Places/OSM, enriquece via crawler assíncrono
    e valida os números de contato.
    """
    total = len(raw_leads)
    
    # 1. Notifica o início do processamento
    self.update_state(
        state='PROGRESS',
        meta={'current': 0, 'total': total, 'status': 'Iniciando rastreamento de websites...'}
    )

    # 2. Executa o batch assíncrono com asyncio (concorrência de 15 a 20 conexões simultâneas)
    enriched_leads = asyncio.run(
        enrich_leads_batch(raw_leads, max_concurrency=15, timeout_sec=3.5)
    )

    # 3. Higieniza e valida os telefones obtidos
    final_leads = []
    for lead in enriched_leads:
        # Prioriza o número de celular achado no site se o original for fixo/vazio
        target_phone = lead.get("whatsapp_number") or lead.get("phone_raw") or lead.get("rawPhone")
        
        valid_phone_data = verify_and_format_real_whatsapp(target_phone)
        if valid_phone_data:
            lead["is_valid_cellphone"] = True
            lead["clean_phone"] = valid_phone_data.get("rawPhone")
            lead["formatted_phone"] = valid_phone_data.get("formattedPhone")
            lead["whatsapp_url"] = valid_phone_data.get("waUrl")
        else:
            lead["is_valid_cellphone"] = False
        
        final_leads.append(lead)

    return {
        "status": "COMPLETED",
        "total_processed": len(final_leads),
        "leads": final_leads
    }
