export class UserDataExportService {
  async exportUserData(userId: string, exportType: string, format: string) {
    console.warn('Supabase integration removed - using API routes');

    try {
      let data: unknown = {}

      switch (exportType) {
        case 'profile':
          data = await this.exportProfileData(userId)
          break
        case 'activity':
          data = await this.exportActivityData(userId)
          break
        case 'searches':
          data = await this.exportSearchData(userId)
          break
        case 'apartments':
          data = await this.exportSavedApartments(userId)
          break
        case 'all':
          data = await this.exportAllUserData(userId)
          break
        default:
          throw new Error(`Unknown export type: ${exportType}`)
      }

      const fileContent = this.formatData(data, format)
      const fileName = `user_export_${exportType}_${Date.now()}.${format}`

      return { fileName, fileContent, exportId: 'stub' }

    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  private async exportActivityData(userId: string) {
    return {
      activities: [],
      total: 0
    }
  }

  private async exportProfileData(userId: string) {
    console.warn('Supabase integration removed - using API routes');
    return {
      preferences: {}
    }
  }

  private async exportSearchData(userId: string) {
    console.warn('Supabase integration removed - using API routes');
    return []
  }

  private async exportSavedApartments(userId: string) {
    console.warn('Supabase integration removed - using API routes');
    return []
  }

  private async exportAllUserData(userId: string) {
    const [activity, profileData, searches, apartments] = await Promise.all([
      this.exportActivityData(userId),
      this.exportProfileData(userId),
      this.exportSearchData(userId),
      this.exportSavedApartments(userId)
    ])

    return {
      activity,
      ...profileData,
      searches,
      saved_apartments: apartments,
      exported_at: new Date().toISOString()
    }
  }

  private formatData(data: unknown, format: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data)
      default:
        return JSON.stringify(data, null, 2)
    }
  }

  private convertToCSV(data: unknown): string {
    if (!Array.isArray(data) || data.length === 0) return JSON.stringify(data);

    const first = data[0] as Record<string, unknown>;
    const headers = Object.keys(first).join(',');
    const rows = (data as Array<Record<string, unknown>>).map(row =>
      Object.values(row).map(value => {
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value === null || value === undefined) return '';
        return String(value);
      }).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  }
}
