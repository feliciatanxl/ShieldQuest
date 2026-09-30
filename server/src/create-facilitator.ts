import readline from 'node:readline';

import { hashPassword } from './auth.js';
import { pool, query } from './db.js';
import { migrate } from './migrate.js';

/**
 * `npm run create-facilitator` — add a facilitator (or the first admin) from
 * the command line.
 *
 * The password is typed here, hidden, and only its hash leaves this machine.
 * That is the point of doing it as a command rather than a form or a chat
 * message: the first admin's password never passes through anything else.
 */

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    if (hidden) {
      const internal = rl as unknown as { _writeToOutput: (text: string) => void };
      internal._writeToOutput = (text: string) => {
        // Echo the prompt itself, and a star for everything typed after it.
        if (text.includes(question)) process.stdout.write(text);
        else if (text !== '\r\n' && text !== '\n') process.stdout.write('*');
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

async function main() {
  await migrate();
  const existing = await query<{ count: number }>(
    `SELECT count(*)::int AS count FROM facilitators`,
  );
  const first = (existing.rows[0]?.count ?? 0) === 0;
  if (first) console.log('No facilitators yet — this one will be an admin.\n');

  const email = (await ask('Work email: ')).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('That is not an email address.');
  const displayName = await ask('Display name (shown in the portal): ');
  if (!displayName) throw new Error('A display name is required.');

  let role: 'admin' | 'facilitator' = 'admin';
  if (!first) {
    const answer = (await ask('Role — admin or facilitator? [facilitator]: ')).toLowerCase();
    role = answer === 'admin' ? 'admin' : 'facilitator';
  }

  const password = await ask('Password (at least 10 characters): ', true);
  if (password.length < 10) throw new Error('The password must be at least 10 characters.');
  const again = await ask('Type it again: ', true);
  if (again !== password) throw new Error('The two passwords do not match.');

  try {
    await query(
      `INSERT INTO facilitators (email, display_name, role, password_hash) VALUES ($1, $2, $3, $4)`,
      [email, displayName, role, await hashPassword(password)],
    );
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error('A facilitator with that email already exists.');
    }
    throw error;
  }
  console.log(`\nCreated ${role} ${email}. Sign in at /admin/login.`);
}

main()
  .catch((error: Error) => {
    console.error(`\n${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool?.end());
