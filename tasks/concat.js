/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

module.exports = function(grunt) {

  // Internal lib.
  var comment = require('./lib/comment').init(grunt);

  grunt.registerMultiTask('concat', 'Concatenate files.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: grunt.util.linefeed,
      banner: '',
      stripBanners: false,
      process: false
    });

    // Normalize boolean options that accept options objects.
    if (options.stripBanners === true) { options.stripBanners = {}; }
    if (options.process === true) { options.process = {}; }

    // Process banner.
    var banner = grunt.template.process(options.banner);

    // Iterate over all specified file groups.
    this.files.forEach(function(fileObj) {
      // The source files to be concatenated. The "nonull" option is used
      // to retain invalid files/patterns so they can be warned about.
      var files = grunt.file.expand({nonull: true}, fileObj.src);

      // Concat banner + specified files.
      var src = banner + files.map(function(filepath) {
        // Warn if a source file/pattern was invalid.
        if (!grunt.file.exists(filepath)) {
          grunt.log.error('Source file "' + filepath + '" not found.');
          return '';
        }
        // Read file source.
        var src = grunt.file.read(filepath);
        // Process files as templates if requested.
        if (options.process) {
          src = grunt.template.process(src, options.process);
        }
        // Strip banners if requested.
        if (options.stripBanners) {
          src = comment.stripBanner(src, options.stripBanners);
        }
        return src;
      }).join(grunt.util.normalizelf(options.separator));

      // Write the destination file.
      grunt.file.write(fileObj.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + fileObj.dest + '" created.');
    }, this);
  });

};
