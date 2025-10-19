import { User } from '../models/user.model';
import logger from '../utils/logger';
import { config } from './index';

export const seedSuperAdmin = async (): Promise<void> => {
    try {
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });

        if (existingSuperAdmin) {
            logger.info('Super admin already exists', {
                email: existingSuperAdmin.email,
            });
            return;
        }

        const superAdminData = {
            name: config.superAdmin.name || 'Super Admin',
            email: config.superAdmin.email || 'superadmin@example.com',
            password: config.superAdmin.password || 'SuperAdmin@123',
            contactNumber: config.superAdmin.contactNumber || '1234567890',
            role: 'superadmin' as const,
            isVerified: true,
        };

        const superAdmin = await User.create(superAdminData);

        logger.info('✅ Super admin seeded successfully', {
            email: superAdmin.email,
            name: superAdmin.name,
        });

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
