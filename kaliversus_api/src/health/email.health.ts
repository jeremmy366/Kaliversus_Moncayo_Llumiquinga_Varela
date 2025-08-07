import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import axios from 'axios';

@Injectable()
export class EmailHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Reemplaza la URL y el header por los de tu proveedor/email real
      const response = await axios.get('https://api.resend.com/v1/domains', {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        timeout: 3000,
      });
      if (response.status === 200) {
        return this.getStatus(key, true);
      }
      throw new Error('Unexpected status: ' + response.status);
    } catch (err) {
      throw new HealthCheckError('Email check failed', this.getStatus(key, false, { message: err.message }));
    }
  }
}
