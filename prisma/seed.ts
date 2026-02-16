import 'dotenv/config'
import { PrismaClient } from "@prisma/client";
import { hash } from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
  const passwordAdmin = await hash('4ndm1N:?', 10) 
  const admin = await prisma.user.upsert({
    where: { email: 'ekbang506@gmail.com' },
    update: {}, 
    create: {
      email: 'ekbang506@gmail.com',
      name: 'Kepala Gudang',
      password: passwordAdmin,
      role: 'admin', 
    },
  })
  console.log('✅ Akun Admin berhasil dibuat:', admin.email)

  const satuanAwal = ["Pcs", "Box", "Unit", "Lusin", "Rim", "Kodi", "Kg", "Liter"];
  for (const nama of satuanAwal) {
    await prisma.satuan.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }
  console.log('✅ Data Satuan berhasil di-seed');

  await prisma.backupSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isEmailActive: false,
      adminEmail: 'ekbang506@gmail.com', 
    }
  });
  console.log('✅ BackupSettings berhasil di-inisialisasi');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })