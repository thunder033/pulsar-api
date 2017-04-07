/**
 * Created by gjr8050 on 2/24/2017.
 */

module.exports = (grunt) => {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            tmp: ['.tmp/*'],
        },
        copy: {
            prod: {
                files: [{expand: true,
                    src: [
                    'src/**/*.js',
                    'src/tsconfig.json',

                    'LICENSE',
                    'tsconfig.json',
                    'package.json',
                ],
                    dest: '.tmp'}],
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['build-prod']);

    grunt.registerTask('build-prod', [
        'clean:tmp',
        'copy:prod',
    ]);
};
