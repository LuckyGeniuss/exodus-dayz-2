#!/bin/bash

# =====================================================
# Exodus DayZ Shop - Database Backup Script
# =====================================================
# Автоматичний бекап бази даних Supabase
#
# Використання:
#   ./scripts/backup-db.sh
#   ./scripts/backup-db.sh --data-only
#   ./scripts/backup-db.sh --schema-only
#
# Вимоги:
#   - Supabase CLI встановлений і налаштований
#   - supabase login виконано
#   - Проект прив'язаний: supabase link --project-ref YOUR_PROJECT_ID
# =====================================================

set -e

# Конфігурація
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_NAME="exodus-dayz-shop"

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функції
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Перевірка наявності Supabase CLI
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI не встановлено!"
        echo "Встановіть за допомогою: npm install -g supabase"
        exit 1
    fi
}

# Створення директорії для бекапів
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_info "Створено директорію для бекапів: $BACKUP_DIR"
    fi
}

# Повний бекап (схема + дані)
full_backup() {
    local filename="${BACKUP_DIR}/${PROJECT_NAME}_full_${TIMESTAMP}.sql"
    log_info "Створення повного бекапу..."
    
    if supabase db dump -f "$filename" 2>/dev/null; then
        log_success "Повний бекап створено: $filename"
        echo "Розмір: $(du -h "$filename" | cut -f1)"
    else
        log_error "Помилка при створенні повного бекапу"
        exit 1
    fi
}

# Бекап тільки схеми
schema_backup() {
    local filename="${BACKUP_DIR}/${PROJECT_NAME}_schema_${TIMESTAMP}.sql"
    log_info "Створення бекапу схеми..."
    
    if supabase db dump --schema-only -f "$filename" 2>/dev/null; then
        log_success "Бекап схеми створено: $filename"
        echo "Розмір: $(du -h "$filename" | cut -f1)"
    else
        log_error "Помилка при створенні бекапу схеми"
        exit 1
    fi
}

# Бекап тільки даних
data_backup() {
    local filename="${BACKUP_DIR}/${PROJECT_NAME}_data_${TIMESTAMP}.sql"
    log_info "Створення бекапу даних..."
    
    if supabase db dump --data-only -f "$filename" 2>/dev/null; then
        log_success "Бекап даних створено: $filename"
        echo "Розмір: $(du -h "$filename" | cut -f1)"
    else
        log_error "Помилка при створенні бекапу даних"
        exit 1
    fi
}

# Очищення старих бекапів (залишаємо останні N)
cleanup_old_backups() {
    local keep_count=10
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt "$keep_count" ]; then
        log_info "Очищення старих бекапів (залишаємо останні $keep_count)..."
        ls -1t "$BACKUP_DIR"/*.sql | tail -n +$((keep_count + 1)) | xargs rm -f
        log_success "Видалено $(($backup_count - $keep_count)) старих бекапів"
    fi
}

# Показати список бекапів
list_backups() {
    log_info "Наявні бекапи:"
    echo "----------------------------------------"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null | awk '{print $9, $5, $6, $7, $8}'
    else
        echo "Бекапи відсутні"
    fi
    echo "----------------------------------------"
}

# Головний скрипт
main() {
    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║   Exodus DayZ Shop - Database Backup     ║"
    echo "╚══════════════════════════════════════════╝"
    echo ""
    
    check_supabase_cli
    create_backup_dir
    
    case "${1:-full}" in
        --schema-only|schema)
            schema_backup
            ;;
        --data-only|data)
            data_backup
            ;;
        --list|list)
            list_backups
            exit 0
            ;;
        --cleanup|cleanup)
            cleanup_old_backups
            exit 0
            ;;
        --help|help|-h)
            echo "Використання: $0 [OPTION]"
            echo ""
            echo "Опції:"
            echo "  (без опцій)    Повний бекап (схема + дані)"
            echo "  --schema-only  Тільки схема бази даних"
            echo "  --data-only    Тільки дані"
            echo "  --list         Показати список бекапів"
            echo "  --cleanup      Видалити старі бекапи"
            echo "  --help         Показати цю довідку"
            exit 0
            ;;
        *)
            full_backup
            ;;
    esac
    
    cleanup_old_backups
    
    echo ""
    log_success "Готово! 🎉"
    echo ""
}

main "$@"
