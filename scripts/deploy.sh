#!/bin/bash

# Script de Deploy - Extrata Academy
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.production.yml" ]; then
    error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado"
    exit 1
fi

# Função para backup do banco
backup_database() {
    log "Criando backup do banco de dados..."
    
    BACKUP_DIR="./backups"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$BACKUP_DIR"
    
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U academy academy > "$BACKUP_DIR/$BACKUP_FILE"; then
        success "Backup criado: $BACKUP_DIR/$BACKUP_FILE"
    else
        warning "Falha ao criar backup (pode ser primeira execução)"
    fi
}

# Função para verificar saúde dos serviços
health_check() {
    log "Verificando saúde dos serviços..."
    
    # Aguardar serviços ficarem prontos
    sleep 30
    
    # Verificar backend
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        success "Backend está saudável"
    else
        error "Backend não está respondendo"
        return 1
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend está saudável"
    else
        error "Frontend não está respondendo"
        return 1
    fi
    
    return 0
}

# Função para rollback
rollback() {
    error "Falha no deploy. Executando rollback..."
    
    # Parar serviços atuais
    docker-compose -f docker-compose.production.yml down
    
    # Restaurar backup se existir
    LATEST_BACKUP=$(ls -t ./backups/backup_*.sql 2>/dev/null | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restaurando backup: $LATEST_BACKUP"
        docker-compose -f docker-compose.production.yml up -d postgres
        sleep 10
        docker-compose -f docker-compose.production.yml exec -T postgres psql -U academy academy < "$LATEST_BACKUP"
    fi
    
    # Iniciar versão anterior
    docker-compose -f docker-compose.production.yml up -d
    
    error "Rollback concluído"
    exit 1
}

# Função principal de deploy
deploy() {
    log "Iniciando deploy da Extrata Academy..."
    
    # Backup do banco
    backup_database
    
    # Parar serviços atuais
    log "Parando serviços atuais..."
    docker-compose -f docker-compose.production.yml down
    
    # Remover imagens antigas
    log "Removendo imagens antigas..."
    docker image prune -f
    
    # Build e start dos serviços
    log "Construindo e iniciando serviços..."
    if ! docker-compose -f docker-compose.production.yml up -d --build; then
        rollback
    fi
    
    # Verificar saúde
    if ! health_check; then
        rollback
    fi
    
    success "Deploy concluído com sucesso!"
    
    # Mostrar status dos serviços
    log "Status dos serviços:"
    docker-compose -f docker-compose.production.yml ps
    
    # Mostrar logs recentes
    log "Logs recentes do backend:"
    docker-compose -f docker-compose.production.yml logs --tail=20 backend
    
    log "Deploy finalizado!"
    log "Frontend: http://localhost:3000"
    log "Backend API: http://localhost:4000/api"
    log "Documentação: http://localhost:4000/api/docs"
    log "Health Check: http://localhost:4000/api/health"
}

# Função para mostrar ajuda
show_help() {
    echo "Script de Deploy - Extrata Academy"
    echo ""
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  deploy     Executar deploy completo (padrão)"
    echo "  backup     Apenas criar backup do banco"
    echo "  health     Verificar saúde dos serviços"
    echo "  logs       Mostrar logs dos serviços"
    echo "  stop       Parar todos os serviços"
    echo "  help       Mostrar esta ajuda"
    echo ""
}

# Função para mostrar logs
show_logs() {
    log "Mostrando logs dos serviços..."
    docker-compose -f docker-compose.production.yml logs -f
}

# Função para parar serviços
stop_services() {
    log "Parando todos os serviços..."
    docker-compose -f docker-compose.production.yml down
    success "Serviços parados"
}

# Processar argumentos
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "backup")
        backup_database
        ;;
    "health")
        health_check
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Opção inválida: $1"
        show_help
        exit 1
        ;;
esac


