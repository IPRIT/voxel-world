const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify( fs.readFile );
const readDirAsync = promisify( fs.readdir );
const writeFileAsync = promisify( fs.writeFile );
const copyFileAsync = promisify( copyFile );

/**
 * @param {string} pathTo
 */
function createDirSafely (pathTo) {
  if (!fs.existsSync( pathTo )) {
    fs.mkdirSync( pathTo );
  }
}

/**
 * @param source
 * @param target
 * @param cb
 */
function copyFile(source, target, cb) {
  let cbCalled = false;

  let rd = fs.createReadStream( source );
  rd.on("error", (err) => {
    done( err );
  });

  let wr = fs.createWriteStream( target );
  wr.on("error", (err) => {
    done( err );
  });
  wr.on("close", (ex) => {
    done();
  });

  rd.pipe(wr);

  function done (err) {
    if (!cbCalled) {
      cb( err );
      cbCalled = true;
    }
  }
}

/**
 * @param {string} inputChunkName
 * @returns {number}
 */
function extractChunkIndex (inputChunkName) {
  let chunkIndexRegex = /_(\d+)\.vox/i;
  return parseInt( inputChunkName.match( chunkIndexRegex )[1] || 0 );
}

/**
 * @param {string} globalArea
 * @returns {number[]}
 */
function parseAreaName (globalArea) {
  return globalArea.split( '-' ).map( Number );
}

/**
 * @param {number} chunkIndex
 * @param {number} globalSize
 * @returns {number[]}
 */
function makeLocalCoord (chunkIndex, globalSize) {
  return [ chunkIndex % globalSize, ( chunkIndex / globalSize ) | 0 ];
}

/**
 * @param {string} chunkName
 * @param {string} areaName
 * @param {number} globalSize
 * @returns {number[]}
 */
function getAbsoluteChunkIndex (chunkName, areaName, globalSize) {
  let [ globalOffsetX = 0, globalOffsetY = 0 ] = parseAreaName( areaName );
  let chunkIndex = extractChunkIndex( chunkName );
  let [ x, y ] = makeLocalCoord( chunkIndex, globalSize );
  return [ (globalSize - x - 1) + globalOffsetX * globalSize, y + globalOffsetY * globalSize ].reverse();
}

/**
 * @param {string} pathTo
 * @return {*}
 */
function readDir (pathTo) {
  return readDirAsync( resolvePath( pathTo ) );
}

/**
 * @param {string} pathTo
 * @return {*}
 */
function resolvePath (pathTo) {
  return path.join( __dirname, pathTo );
}

async function run () {
  let [
    globalSize = 8,
    inputPath = '../resources/models/qubicle/input',
    outputPath = '../resources/models/qubicle/output',
    finalPath = '../resources/models/chunks'
  ] = process.argv.slice( 2 );

  createDirSafely(
    resolvePath( outputPath )
  );

  createDirSafely(
    resolvePath( finalPath )
  );

  let globalAreas = await readDir( inputPath );
  for (let areaName of globalAreas) {
    let chunks = await readDir( `${inputPath}/${areaName}` );
    let chunksIndexes = chunks.map(chunkName => getAbsoluteChunkIndex( chunkName, areaName, globalSize ));
    for (let i = 0; i < chunks.length; ++i) {
      let inputChunkName = chunks[ i ];
      let chunkIndex = chunksIndexes[ i ];
      let sourcePathFrom = resolvePath( `${inputPath}/${areaName}/${inputChunkName}` );

      createDirSafely(
        resolvePath( `${outputPath}/${areaName}` )
      );

      let outputPathTo = resolvePath( `${outputPath}/${areaName}/chunk-${chunkIndex.join('-')}.vox` );
      copyFileAsync( sourcePathFrom, outputPathTo ).then(_ => {
        let finalPathTo = resolvePath( `${finalPath}/chunk-${chunkIndex.join('-')}.vox` );
        return copyFileAsync( outputPathTo, finalPathTo );
      });
    }
  }
}

run();
