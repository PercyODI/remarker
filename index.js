#!/usr/bin/env node

const { asset, dest, name, on, port } = require('berber')
const layout1 = require('layout1')
const rename = require('gulp-rename')
const frontMatter = require('gulp-front-matter')
const gulpData = require('gulp-data')
const vinyl = require('vinyl')
const findUp = require('find-up')
const { readFileSync, existsSync } = require('fs')
const { join } = require('path')
require('require-yaml')

const script = readFileSync(join(__dirname, 'vendor/remark.js'))
const layoutFilename = join(__dirname, 'layout.njk')

const defaultCss = `
  body {
    font-family: 'Avenir Next', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'メイリオ', sans-serif;
  }
  h1, h2, h3 {
    font-weight: bold;
  }
  .remark-code,
  .remark-inline-code {
    font-family: 'Menlo', 'Monaco', 'Courier new', monospace;
  }

  .remark-slide-content.inverse {
    color: #f3f3f3;
    background-color: #272822;
  }
`

name('remarker')

on('config', config => {
  config = config || {}

  port(config.port || 6275)
  dest(config.dest || 'build')

  asset(config.source || config.sourceDir ? config.sourceDir + '/**/*.md' : undefined || 'src/**/*.md')
    .pipe(rename({ extname: '.html' }))
    .pipe(frontMatter({
      property: 'frontMatter',
      remove: true
    }))
    .pipe(gulpData(function (file) {
      var isFoundUp = findUp.sync('base.css', {cwd: file.path})
      return {
        script,
        baseCss: existsSync(isFoundUp) ?  readFileSync(isFoundUp) : defaultCss,
        css: file.frontMatter.css || config.css || '',
        title: file.frontMatter.title || config.title || '',
        remarkConfig: file.frontMatter.remarkConfig || config.remarkConfig || {}
      }
    }))
    .pipe(layout1.nunjucks(layoutFilename))

  const assets = config.assets || ['assets']
  assets.forEach(src => {
    asset(join(src, '**/*.*')).base(process.cwd())
  })
})
