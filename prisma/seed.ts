import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const swarms = [
  { id: 'corporate', name: 'Corporate Law', description: 'Securities, M&A, governance', icon: '🎬', color: '#4A5568', agents: ["Keyes","Bannister","Gittes","Gutman","Spade","Marlowe","Archer","Neff","Cairo","OHara","Hammer","Queen","Vance"] },
  { id: 'criminal', name: 'Criminal Defense', description: 'Defense strategy and case analysis', icon: '⚖️', color: '#C53030', agents: ["Holmes","Poirot","Marple","Columbo","Perry","McCoy","Wolfe","Morse","Chan","Dupin","Brown","Archer"] },
  { id: 'family', name: 'Family Law', description: 'Custody, divorce, and family matters', icon: '👨‍👩‍👧', color: '#2B6CB0', agents: ["Bennet","Eyre","Earnshaw","Dashwood","March","Rochester","Woodhouse","Darcy","Knightley","Ferrars","Brandon","Tilney"] },
  { id: 'immigration', name: 'Immigration Law', description: 'Visas, asylum, and naturalization', icon: '🌍', color: '#2F855A', agents: ["Polo","Magellan","Columbus","Darwin","Earhart","Shackleton","Cook","Vespucci","Drake","Livingstone","Hudson","Lewis"] },
  { id: 'ip_entertainment', name: 'IP & Entertainment', description: 'Patents, trademarks, and entertainment law', icon: '🎭', color: '#6B46C1', agents: ["Selznick","Goldwyn","Mayer","Zanuck","Warner","Thalberg","Cohn","Laemmle","Zukor","Fox","Disney","Universal"] },
  { id: 'personal_injury', name: 'Personal Injury', description: 'Tort claims and injury litigation', icon: '🏥', color: '#DD6B20', agents: ["House","Grey","Welby","Quincy","Trapper","Kildare","Pierce","Carter","Ross","Shepherd","Kovac","Greene"] },
  { id: 'real_estate', name: 'Real Estate', description: 'Property transactions and land use', icon: '🏠', color: '#319795', agents: ["Earp","Hickok","Oakley","Cody","Cassidy","Holliday","Masterson","Garrett","Horn","Starr","James","Younger"] },
];

async function main() {
  console.log('Seeding swarms...');
  
  for (const swarm of swarms) {
    await prisma.swarm.upsert({
      where: { id: swarm.id },
      update: { name: swarm.name, description: swarm.description, icon: swarm.icon, color: swarm.color, agents: swarm.agents },
      create: swarm,
    });
    console.log(`  ✓ ${swarm.name}`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
