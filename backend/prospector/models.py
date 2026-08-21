from django.db import models

class TargetLocation(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Nome da Localização")
    city = models.CharField(max_length=120, verbose_name="Cidade")
    state = models.CharField(max_length=50, default="BR", verbose_name="Estado/UF")
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    zoom = models.IntegerField(default=14, verbose_name="Zoom Inicial")
    is_custom = models.BooleanField(default=True, verbose_name="Criado pelo Usuário")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ProjectAnalysis(models.Model):
    repo_url = models.CharField(max_length=500, verbose_name="URL do Repositório / Produto")
    repo_name = models.CharField(max_length=200, verbose_name="Nome do Projeto")
    description = models.TextField(blank=True, verbose_name="Descrição")
    icp_data = models.JSONField(default=dict, verbose_name="Perfil de Cliente Ideal (ICP)")
    core_value_prop = models.TextField(blank=True, verbose_name="Proposta de Valor")
    search_keywords = models.JSONField(default=list, verbose_name="Palavras-chave Maps")
    solved_pain_points = models.JSONField(default=list, verbose_name="Dores Resolvidas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.repo_name


class Lead(models.Model):
    lead_id = models.CharField(max_length=255, unique=True, verbose_name="ID do Estabelecimento")
    display_name = models.CharField(max_length=255, verbose_name="Nome do Local")
    contact_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Nome do Contato/Gerente")
    category = models.CharField(max_length=120, verbose_name="Categoria")
    formatted_address = models.CharField(max_length=500, verbose_name="Endereço")
    neighborhood = models.CharField(max_length=120, blank=True, verbose_name="Bairro")
    city = models.CharField(max_length=120, blank=True, verbose_name="Cidade")
    latitude = models.FloatField(verbose_name="Latitude", default=0.0)
    longitude = models.FloatField(verbose_name="Longitude", default=0.0)
    has_website = models.BooleanField(default=False, verbose_name="Tem Website")
    website_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="URL do Site")
    has_whatsapp = models.BooleanField(default=True, verbose_name="Tem WhatsApp")
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Telefone")
    raw_phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Telefone Cru")
    rating = models.FloatField(default=4.5, verbose_name="Avaliação Google")
    reviews_count = models.IntegerField(default=0, verbose_name="Qtd de Avaliações")
    google_maps_uri = models.CharField(max_length=500, blank=True, verbose_name="Link Maps")
    photo_url = models.CharField(max_length=1000, blank=True, null=True, verbose_name="Foto")
    score_percentage = models.IntegerField(default=0, verbose_name="Score de Fechamento (%)")
    classification = models.CharField(max_length=50, default="Baixa Prioridade", verbose_name="Classificação")
    rationale = models.TextField(blank=True, verbose_name="Justificativa da IA/Heurística")
    custom_pitch = models.TextField(blank=True, verbose_name="Pitch de WhatsApp")
    
    # CRM & Sales Pipeline Fields
    crm_status = models.CharField(
        max_length=50,
        default="Novo",
        choices=[
            ("Novo", "Novo Lead"),
            ("Contatado", "Contato Feito"),
            ("Demonstracao", "Em Demonstração"),
            ("Fechado", "Cliente Fechado"),
            ("Perdido", "Perdido"),
        ],
        verbose_name="Status no CRM",
    )
    monthly_fee = models.FloatField(default=150.0, verbose_name="Mensalidade Recorrente (R$)")
    setup_fee = models.FloatField(default=400.0, verbose_name="Taxa de Setup/Implantação (R$)")
    is_saved = models.BooleanField(default=True, verbose_name="Lead Salvo no CRM")
    notes = models.TextField(blank=True, verbose_name="Notas Internas & Objeções")
    timeline_logs = models.JSONField(default=list, verbose_name="Histórico de Interações")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.display_name} - {self.crm_status} (Score: {self.score_percentage}%)"
