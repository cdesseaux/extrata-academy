# 📦 S3 Storage - Extrata Academy

## ✅ Configuração Atual

### Bucket S3
- **Nome:** `extrata-academy`
- **Região:** `us-east-1`
- **Uso:** Dev, Homologação e Produção (mesmo bucket)

### Credenciais AWS (Configuradas)
- **Access Key:** `AKIA36X4ZHQ3M3VYKRQG`
- **Secret:** Configurada no `.env`
- **Região:** `us-east-1`

### Status
- ✅ Backend configurado para usar S3
- ✅ Variáveis de ambiente atualizadas
- ✅ Helmet configurado para permitir URLs S3
- ✅ `STORAGE_TYPE=s3` ativado

---

## 🚨 AÇÃO NECESSÁRIA - SEGURANÇA

**IMPORTANTE:** As credenciais AWS foram expostas durante a configuração. Após validar o funcionamento:

1. Acesse AWS Console → IAM → Users → `extrata-academy-s3-user`
2. Security credentials → Access keys
3. **Revogue a chave:** `AKIA36X4ZHQ3M3VYKRQG`
4. Crie uma nova Access Key
5. Atualize o `.env` com as novas credenciais
6. Reinicie o backend: `docker-compose restart backend`

---

## 🔧 Configuração do Bucket S3

### 🔒 **IMPORTANTE: Arquivos Privados com Presigned URLs**

O sistema usa **Presigned URLs** (URLs assinadas temporárias) para acesso seguro aos arquivos. Os arquivos ficam **privados** no S3 e só são acessíveis por usuários autenticados através de URLs temporárias geradas pelo backend.

**✅ Benefícios:**
- Arquivos privados no S3
- Apenas usuários autenticados podem acessar
- URLs expiram automaticamente (1 hora)
- Maior segurança e controle de acesso

### 1. CORS Configuration (Necessário)

Acesse: AWS Console → S3 → `extrata-academy` → Permissions → CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://*.extrata.com.br"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 2. Block Public Access Settings (Manter Ativo)

Acesse: AWS Console → S3 → `extrata-academy` → Permissions → Block public access

**MANTER TODAS AS OPÇÕES ATIVADAS:**
- ✅ Block all public access
- ✅ Block public access to buckets and objects granted through new access control lists (ACLs)
- ✅ Block public access to buckets and objects granted through any access control lists (ACLs)
- ✅ Block public access to buckets and objects granted through new public bucket or access point policies
- ✅ Block public and cross-account access to buckets and objects through any public bucket or access point policies

**❌ NÃO PRECISA de Bucket Policy pública** - O acesso é feito via Presigned URLs geradas pelo backend.

---

## 📂 Estrutura de Pastas no S3

O sistema organiza automaticamente os arquivos:

```
extrata-academy/
├── videos/
│   ├── uuid-1.mp4
│   ├── uuid-2.webm
│   └── ...
├── pdfs/
│   ├── uuid-3.pdf
│   └── ...
├── images/
│   ├── uuid-4.jpg
│   ├── uuid-5.png
│   └── ...
├── documents/
│   └── ...
└── others/
    └── ...
```

---

## 🧪 Testes

### 1. Reiniciar Backend
```bash
docker-compose restart backend
```

### 2. Verificar Logs
```bash
docker-compose logs -f backend | grep -i s3
```

### 3. Testar Upload

**Via Frontend:**
1. Acesse: http://localhost:3000
2. Login com Keycloak
3. Acesse qualquer curso → Gerenciar → Adicionar Lição
4. Selecione "Vídeo" ou "PDF"
5. Faça upload de um arquivo
6. Verifique no S3 se o arquivo apareceu

**Via Swagger:**
1. Acesse: http://localhost:4000/api/docs
2. Authorize com JWT token
3. POST `/api/files/upload/video` ou `/upload/pdf`
4. Selecione arquivo e envie

### 4. Verificar no S3
```bash
aws s3 ls s3://extrata-academy/videos/ --region us-east-1
aws s3 ls s3://extrata-academy/pdfs/ --region us-east-1
```

---

## 📊 URLs Geradas

### Formato das URLs
```
https://extrata-academy.s3.amazonaws.com/videos/uuid.mp4
https://extrata-academy.s3.amazonaws.com/pdfs/uuid.pdf
```

### Exemplo de Resposta do Upload
```json
{
  "id": "uuid-do-arquivo",
  "originalName": "video-aula.mp4",
  "filename": "abc123-def456.mp4",
  "mimetype": "video/mp4",
  "size": 52428800,
  "type": "video",
  "url": "https://extrata-academy.s3.amazonaws.com/videos/abc123-def456.mp4",
  "uploadedBy": "user-id",
  "createdAt": "2025-10-16T20:00:00.000Z"
}
```

---

## 🔄 Migração de Arquivos Locais → S3 (Futuro)

Quando houver arquivos no storage local que precisam migrar:

### Script de Migração
```bash
# Será criado futuramente
npm run migrate:s3
```

### Processo Manual
1. Listar arquivos locais: `backend/storage/`
2. Para cada arquivo:
   - Upload para S3 usando AWS SDK
   - Atualizar URL no banco de dados
   - Deletar arquivo local

---

## 💰 Estimativa de Custos

### Preços S3 (us-east-1)
- **Storage:** $0.023/GB/mês
- **PUT requests:** $0.005/1.000 requests
- **GET requests:** $0.0004/1.000 requests

### Cenário: 100GB de vídeos + 10.000 downloads/mês
- Storage: 100GB × $0.023 = **$2.30/mês**
- Uploads: 100 × $0.005 = **$0.0005/mês**
- Downloads: 10.000 × $0.0004 = **$4.00/mês**
- **Total: ~$6.30/mês**

### Redução de Custos
- Habilitar **S3 Intelligent-Tiering** para arquivos antigos
- Lifecycle policy para mover vídeos antigos (>90 dias) para Glacier
- CloudFront CDN para cache (reduz GET requests)

---

## 🚀 Próximos Passos (Opcional)

### 1. CloudFront CDN
- Distribuição mais rápida de vídeos
- Cache de conteúdo global
- Redução de custos S3

### 2. Presigned URLs (Vídeos Privados)
- Gerar URLs temporárias (expiram em X horas)
- Controle de acesso mais granular
- Segurança adicional

### 3. Multipart Upload
- Para vídeos > 100MB
- Upload mais rápido e resiliente
- Retry automático de partes falhadas

### 4. Thumbnails Automáticos
- AWS Lambda + MediaConvert
- Gerar thumbnails de vídeos
- Salvar no campo `thumbnailUrl`

---

## 🐛 Troubleshooting

### Erro: "Access Denied"
- Verificar credenciais no `.env`
- Verificar permissões IAM do usuário
- Verificar Bucket Policy

### Erro: "CORS Error"
- Verificar CORS configuration no bucket
- Verificar `AllowedOrigins` inclui seu domínio

### Arquivo não aparece no S3
- Verificar logs do backend: `docker-compose logs backend`
- Verificar se `STORAGE_TYPE=s3` no `.env`
- Verificar se bucket name está correto

### URL retorna 403 Forbidden
- Verificar Bucket Policy permite public read
- Verificar Block Public Access settings

---

## 📝 Checklist de Deploy

### Desenvolvimento ✅
- [x] Configurar credenciais AWS
- [x] Atualizar STORAGE_TYPE=s3
- [x] Configurar Helmet
- [ ] Testar upload de vídeo
- [ ] Testar upload de PDF
- [ ] Validar URLs funcionando

### Homologação
- [ ] Usar mesmo bucket `extrata-academy`
- [ ] Testar com dados reais
- [ ] Validar performance

### Produção
- [ ] Revogar credenciais antigas
- [ ] Criar novas credenciais
- [ ] Atualizar `.env.production`
- [ ] Configurar CloudFront (opcional)
- [ ] Configurar Lifecycle policies
- [ ] Configurar CloudWatch alarms
- [ ] Documentar processo

---

## 📚 Referências

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)
