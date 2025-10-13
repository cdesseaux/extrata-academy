import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export interface DetailedHealthStatus extends HealthStatus {
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  services: {
    keycloak: 'reachable' | 'unreachable';
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const isHealthy = await this.isSystemHealthy();
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async getDetailedHealthStatus(): Promise<DetailedHealthStatus> {
    const basicStatus = await this.getHealthStatus();
    
    // Teste de conexão com banco
    const dbStatus = await this.checkDatabaseConnection();
    
    // Informações de memória
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
    const usedMemory = memoryUsage.heapUsed;
    
    // Teste de conectividade com Keycloak
    const keycloakStatus = await this.checkKeycloakConnection();

    return {
      ...basicStatus,
      database: dbStatus,
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      services: {
        keycloak: keycloakStatus,
      },
    };
  }

  async getReadinessStatus(): Promise<{ status: 'ready' | 'not ready' }> {
    const isReady = await this.isSystemReady();
    return {
      status: isReady ? 'ready' : 'not ready',
    };
  }

  async getLivenessStatus(): Promise<{ status: 'alive' | 'dead' }> {
    return {
      status: 'alive',
    };
  }

  private async isSystemHealthy(): Promise<boolean> {
    try {
      // Verifica se o banco está conectado
      const dbHealthy = await this.checkDatabaseConnection();
      return dbHealthy.status === 'connected';
    } catch (error) {
      return false;
    }
  }

  private async isSystemReady(): Promise<boolean> {
    try {
      // Verifica se todos os serviços essenciais estão prontos
      const dbReady = await this.checkDatabaseConnection();
      const keycloakReady = await this.checkKeycloakConnection();
      
      return dbReady.status === 'connected' && keycloakReady === 'reachable';
    } catch (error) {
      return false;
    }
  }

  private async checkDatabaseConnection(): Promise<{
    status: 'connected' | 'disconnected';
    responseTime?: number;
  }> {
    try {
      const startTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'connected',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'disconnected',
      };
    }
  }

  private async checkKeycloakConnection(): Promise<'reachable' | 'unreachable'> {
    try {
      const keycloakUrl = process.env.KEYCLOAK_URL || 'https://keycloak-hlg.extrata.com.br';
      const response = await fetch(`${keycloakUrl}/realms/extrata`, {
        method: 'GET',
        timeout: 5000,
      } as any);
      
      return response.ok ? 'reachable' : 'unreachable';
    } catch (error) {
      return 'unreachable';
    }
  }
}


