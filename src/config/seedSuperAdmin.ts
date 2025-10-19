import { User } from '../models/user.model';
import logger from '../utils/logger';
import { config } from './index';

export const seedSuperAdmin = async (): Promise<void> => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });

        if (existingSuperAdmin) {
            logger.info('Super admin already exists', {
                email: existingSuperAdmin.email,
            });
            return;
        }

        // Get super admin credentials from environment or use defaults
        const superAdminData = {
            name: config.superAdmin.name || 'Super Admin',
            email: config.superAdmin.email || 'superadmin@example.com',
            password: config.superAdmin.password || 'SuperAdmin@123',
            contactNumber: config.superAdmin.contactNumber || '1234567890',
            role: 'superadmin' as const,
            isVerified: true, // Super admin is auto-verified
        };

        // Create super admin
        const superAdmin = await User.create(superAdminData);

        logger.info('✅ Super admin seeded successfully', {
            email: superAdmin.email,
            name: superAdmin.name,
        });

        // Log warning if using default credentials
        if (config.superAdmin.password === 'SuperAdmin@123' || !config.superAdmin.password) {
            logger.warn(
                '⚠️ WARNING: Super admin is using default password! Please change it immediately for security.',
            );
        }
    } catch (error) {
        logger.error('❌ Error seeding super admin:', error);
        throw error;
    }
};
