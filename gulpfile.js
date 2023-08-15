const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const terser = require('gulp-terser');
const tsify = require('tsify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');
const fancy_log = require('fancy-log');
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const rename = require('gulp-rename');
const {rimraf} = require('rimraf');
const yargs = require('yargs');

const argv = yargs.argv;
const noSourceMaps = argv.noSourceMaps !== undefined;

const destPath = './dist';

const githubPagesPath = './dist-pages';

const watchedBrowserify = watchify(
	browserify({
		basedir: '.',
		debug: (noSourceMaps ? false : true),
		entries: ['src/Game.ts'],
		cache: {},
		packageCache: {}
	})
	.plugin(tsify) // , { noEmitOptimizations: true })
);

bundleScripts = function() {
	if (noSourceMaps) {
		return watchedBrowserify
			.bundle()
			.on('error', fancy_log)
			.pipe(source('bundle.js'))
			.pipe(buffer())
			.pipe(terser())
			.pipe(gulp.dest(destPath));
	} else {
		return watchedBrowserify
			.bundle()
			.on('error', fancy_log)
			.pipe(source('bundle.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(terser())
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(destPath));
	}
}

gulp.task('clean', () => {
	return rimraf(destPath);
});

gulp.task('html', () => {
	return gulp.src(['index.html'])
		.pipe(gulp.dest(destPath));
})

gulp.task('scripts', bundleScripts);

gulp.task('assets', () => {
	return gulp.src(['src/assets/**'])
		.pipe(gulp.dest(destPath + '/assets'));
})

gulp.task('default',
	gulp.series(
		gulp.parallel('clean'),
		gulp.parallel('html', 'scripts', 'assets')
	)
);

gulp.task('stop-watchify', function (done) {
	watchedBrowserify.close();
	done();
});

gulp.task('github-pages-clean', () => {
	return rimraf(githubPagesPath);
})

gulp.task('github-pages-gzip', () => {
	return gulp.src(destPath + '/**')
		.pipe(tar('site.tar'))
		.pipe(gzip())
		.pipe(rename('github-pages'))
		.pipe(gulp.dest(githubPagesPath));
})

gulp.task('build',
	gulp.series(
		gulp.parallel('clean'),
		gulp.parallel('html', 'scripts', 'assets'),
		gulp.parallel('github-pages-clean'),
		gulp.parallel('github-pages-gzip'),
		gulp.parallel('stop-watchify')
	)
);

/* Watching for updates */
watchedBrowserify.on('update', bundleScripts);
watchedBrowserify.on('log', fancy_log);
