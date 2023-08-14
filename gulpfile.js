const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const terser = require('gulp-terser');
const tsify = require('tsify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');
const fancy_log = require('fancy-log');
const yargs = require('yargs');

const argv = yargs.argv;
const noSourceMaps = argv.noSourceMaps !== undefined;

const destPath = './dist';

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

gulp.task('scripts', bundleScripts);

gulp.task('default',
	gulp.series(
		gulp.parallel('scripts'),
	)
);

gulp.task('stop-watchify', function (done) {
	watchedBrowserify.close();
	done();
});

gulp.task('build',
	gulp.series(
		gulp.parallel('scripts'),
		gulp.parallel('stop-watchify')
	)
);

/* Watching for updates */
watchedBrowserify.on('update', bundleScripts);
watchedBrowserify.on('log', fancy_log);
