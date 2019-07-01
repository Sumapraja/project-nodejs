const chalk = require('chalk')

// ---

const name = 'Zero Megaman'
console.log(chalk.red(name))

// ---

const info = chalk.keyword('blue')

const names = ['Alpha Avalon', 'Betty Brave', 'Gamma Gacurio']
names.forEach(name => {
  console.log(info(name))
})

const logSymbols = require('log-symbols');
 
console.log(logSymbols.success, 'Finished successfully!');
console.log(logSymbols.warning, 'Watch out!');
console.log(logSymbols.info, 'Hello there');
console.log(logSymbols.success, 'Hooray!!');

const execa = require('execa');
const Listr = require('listr');

const tasks = new Listr([
	{
		title: 'Git',
		task: () => {
			return new Listr([
				{
					title: 'Checking git status',
					task: () => execa.stdout('git', ['status', '--porcelain']).then(result => {
						if (result !== '') {
							throw new Error('Unclean working tree. Commit or stash changes first.');
						}
					})
				},
				{
					title: 'Checking remote history',
					task: () => execa.stdout('git', ['rev-list', '--count', '--left-only', '@{u}...HEAD']).then(result => {
						if (result !== '0') {
							throw new Error('Remote history differ. Please pull changes.');
						}
					})
				}
			], {concurrent: true});
		}
	},
	{
		title: 'Install package dependencies with Yarn',
		task: (ctx, task) => execa('yarn')
			.catch(() => {
				ctx.yarn = false;

				task.skip('Yarn not available, install it via `npm install -g yarn`');
			})
	},
	{
		title: 'Install package dependencies with npm',
		enabled: ctx => ctx.yarn === false,
		task: () => execa('npm', ['install'])
	},
	{
		title: 'Run tests',
		task: () => execa('npm', ['test'])
	},
]);

tasks.run().catch(err => {
	console.error(err);
});