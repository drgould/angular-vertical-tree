var buildDir = 'build/',
    distDir = 'dist/',
    srcDir = 'src/',
    jsFilename = 'angularVerticalTree.js',
    jsFilenameMin = 'angularVerticalTree.min.js',
    templateFilename = 'angularVerticalTree.tpl.html',
    templateJsFilename = 'angularVerticalTree.tpl.js';

module.exports = {
    srcFiles : [
        srcDir + jsFilename
    ],
    templateFiles : [
        srcDir + templateFilename
    ],
    depFiles : [
        'node_modules/jquery/dist/jquery.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-mocks/angular-mocks.js'
    ],
    testFiles : [
        'test/angularVerticalTree.spec.js'
    ],
    demoFiles : [
        'demo/index.html',
        'demo/js/script.js',
        'demo/css/style.css'
    ],
    buildFiles : [
        buildDir + jsFilename,
        buildDir + templateJsFilename
    ],
    distDir : distDir,
    buildDir : buildDir,
    jsFilename : jsFilename,
    jsFilenameMin : jsFilenameMin,
    templateJsFilename : templateJsFilename,
    karmaConf : __dirname + '/karma.conf.js'
};