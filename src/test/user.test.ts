import prisma from '../db/prisma';

async function test() {
  const user = await prisma.user.create({
    data: {
      githubId: '999999',
      username: 'TEST_USER',
      email: 'test@example.com',
    },
  });
  console.log('Created user:', user);
}

test();
