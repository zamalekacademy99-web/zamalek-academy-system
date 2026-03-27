import { PrismaClient, Role, PlayerStatus, PaymentMethod, AttendanceStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing data...');
    // Delete all to start fresh (cascade handles most)
    await prisma.auditLog.deleteMany();
    await prisma.parentRequest.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.player.deleteMany();
    await prisma.pricingPlan.deleteMany();
    await prisma.group.deleteMany();
    await prisma.coach.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.user.deleteMany();

    console.log('Seeding demo data...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Users (Super Admin, Admin, Parent)
    const superAdmin = await prisma.user.create({
        data: { name: 'الإدارة العليا', email: 'management@zamalek.com', password_hash: passwordHash, role: Role.SUPER_ADMIN }
    });

    const admin = await prisma.user.create({
        data: { name: 'مدير فرع الاستاد', email: 'admin@zamalek.com', password_hash: passwordHash, role: Role.ADMIN }
    });

    const parentUser = await prisma.user.create({
        data: { name: 'وليد محمود', email: 'parent@zamalek.com', password_hash: passwordHash, role: Role.PARENT }
    });

    const parent = await prisma.parent.create({
        data: { user_id: parentUser.id, phone: '01012345678', address: 'طنطا، ش النادي' }
    });

    // 2. Branches
    const branchTanta = await prisma.branch.create({
        data: { name: 'فرع طنطا (الاستاد)', location: 'طنطا' }
    });

    const branchMahalla = await prisma.branch.create({
        data: { name: 'فرع المحلة', location: 'المحلة الكبرى' }
    });

    // 3. Coaches
    const coach1User = await prisma.user.create({
        data: { name: 'كابتن حمدي', email: 'coach.hamdy@zamalek.com', password_hash: passwordHash, role: Role.PARENT } // Coach uses dummy account for now
    });
    const coachHamdy = await prisma.coach.create({
        data: { full_name: 'حمدي كمال', phone: '01122334455', branch_id: branchTanta.id, user_id: coach1User.id }
    });

    const coach2User = await prisma.user.create({
        data: { name: 'كابتن طارق', email: 'coach.tarek@zamalek.com', password_hash: passwordHash, role: Role.PARENT }
    });
    const coachTarek = await prisma.coach.create({
        data: { full_name: 'طارق يحيى', phone: '01234567890', branch_id: branchMahalla.id, user_id: coach2User.id }
    });

    // 4. Groups
    const groupU12 = await prisma.group.create({
        data: { name: 'U-12', age_category: '11-12 سنة', branch_id: branchTanta.id }
    });

    const groupU10 = await prisma.group.create({
        data: { name: 'U-10', age_category: '9-10 سنوات', branch_id: branchTanta.id }
    });

    const groupU14 = await prisma.group.create({
        data: { name: 'U-14', age_category: '13-14 سنة', branch_id: branchMahalla.id }
    });

    // 5. Schedules
    const scheduleU12 = await prisma.schedule.create({
        data: { branch_id: branchTanta.id, group_id: groupU12.id, coach_id: coachHamdy.id, day_of_week: 6, start_time: '16:00', end_time: '18:00', field_name: 'الملعب الرئيسي' }
    });

    // 6. Players
    const player1 = await prisma.player.create({
        data: {
            first_name: 'أحمد', last_name: 'وليد', dob: new Date('2014-05-10'), parent_id: parent.id,
            branch_id: branchTanta.id, group_id: groupU12.id, coach_id: coachHamdy.id,
            status: PlayerStatus.ACTIVE, subscription_start_date: new Date('2026-01-01')
        }
    });

    const player2 = await prisma.player.create({
        data: {
            first_name: 'ياسين', last_name: 'وليد', dob: new Date('2016-08-20'), parent_id: parent.id,
            branch_id: branchTanta.id, group_id: groupU10.id, coach_id: coachHamdy.id,
            status: PlayerStatus.PENDING, subscription_start_date: new Date('2026-03-01')
        }
    });

    // 7. Attendance
    await prisma.attendance.create({
        data: { player_id: player1.id, schedule_id: scheduleU12.id, date: new Date('2026-05-09'), status: AttendanceStatus.PRESENT }
    });
    await prisma.attendance.create({
        data: { player_id: player1.id, schedule_id: scheduleU12.id, date: new Date('2026-05-16'), status: AttendanceStatus.ABSENT_UNEXCUSED }
    });

    // 8. Payments
    await prisma.payment.create({
        data: { player_id: player1.id, amount: 500, method: PaymentMethod.CASH, reference_no: 'TRX-101', date: new Date('2026-01-05'), recorded_by: superAdmin.id, notes: 'اشتراك يناير' }
    });
    await prisma.payment.create({
        data: { player_id: player1.id, amount: 500, method: PaymentMethod.BANK_TRANSFER, reference_no: 'TRX-102', date: new Date('2026-02-05'), recorded_by: superAdmin.id, notes: 'اشتراك فبراير' }
    });

    // 9. Coach Evaluations
    await prisma.evaluation.create({
        data: { player_id: player1.id, coach_id: coachHamdy.id, date: new Date(), commitment_score: 8, discipline_score: 9, fitness_score: 7, technical_score: 8, notes: 'اللاعب لديه مهارات جيدة في التسديد، يحتاج لرفع اللياقة.' }
    });

    // 10. Notifications
    await prisma.notification.create({
        data: { user_id: parentUser.id, title: 'موعد التدريب القادم', message: 'نذكركم بموعد تدريب اللاعب أحمد يوم السبت الساعة 4 عصراً', type: NotificationType.REMINDER }
    });

    console.log('✅ Demo data seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
