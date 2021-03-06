// Generated by CoffeeScript 1.3.3
var Batch, Handle, Iterator, Snapshot, binding, noop;

binding = require('../leveldb.node');

Batch = require('./batch').Batch;

Iterator = require('./iterator').Iterator;

noop = function() {};

/*

    Open a leveldb database.

    @param {String} path The path to the database file.
    @param {Object} [options] Optional options corresponding to the leveldb
      options. See also the `leveldb/options.h` header file.
      @param {Boolean} [options.create_if_missing=false] If true, the
        database will be created if it is missing.
      @param {Boolean} [options.error_if_exists=false] If true, an error is
        raised if the database already exists.
      @param {Boolean} [options.paranoid_checks=false] If true, the
        implementation will do aggressive checking of the data it is
        processing and will stop early if it detects any errors.  This may
        have unforeseen ramifications: for example, a corruption of one DB
        entry may cause a large number of entries to become unreadable or
        for the entire DB to become unopenable.
      @param {Integer} [options.write_buffer_size=4*1024*1024] Amount of
        data to build up in memory (backed by an unsorted log on disk)
        before converting to a sorted on-disk file, in bytes.
      @param {Integer} [options.max_open_files=1000] Maximum number of open
        files that can be used by the database. You may need to increase
        this if your database has a large working set (budget one open file
        per 2MB of working set).
      @param {Integer} [options.block_size=4096] Approximate size of user
        data packed per block, in bytes. Note that the block size specified
        here corresponds to uncompressed data. The actual size of the unit
        read from disk may be smaller if compression is enabled. This
        parameter can be changed dynamically.
      @param {Integer} [options.block_restart_interval=16] Number of keys
        between restart points for delta encoding of keys. This parameter
        can be changed dynamically. Most clients should leave this parameter
        alone.
      @param {Boolean} [options.compression=true] Set to false to disable
        Snappy compression.
    @param {Function} [callback] Optional callback. If not given, returns
      the database handle synchronously.
      @param {Error} error The error value on error, null otherwise.
      @param {leveldb.Handle} handle If successful, the database handle.
*/


exports.open = function(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  if (!callback) {
    throw new Error('Missing callback');
  }
  return binding.open(path, options, function(err, self) {
    var handle;
    handle = self && new Handle(self);
    return callback(err, handle);
  });
};

/*

    Destroy a leveldb database.

    @param {String} path The path to the database file.
    @param {Object} [options] Optional options. See `leveldb.open()`.
    @param {Function} [callback] Optional callback.
      @param {Error} error The error value on error, null otherwise.
*/


exports.destroy = function(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  return binding.destroy(path, options, callback || noop);
};

/*

    Repair a leveldb database.

    @param {String} path The path to the database file.
    @param {Object} [options] Optional options. See `leveldb.open()`.
    @param {Function} [callback] Optional callback.
      @param {Error} error The error value on error, null otherwise.
*/


exports.repair = function(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  return binding.repair(path, options, callback || noop);
};

/*

    A handle represents an open leveldb database.
*/


Handle = (function() {
  /*
  
        Constructor.
  
        @param {Native} self The native handle binding.
  */

  function Handle(self) {
    this.self = self;
  }

  /*
  
        Get a value from the database.
  
        @param {String|Buffer} key The key to get.
        @param {Object} [options] Optional options. See also the
          `leveldb/options.h` header file.
          @param {Boolean} [options.verify_checksums=false] If true, all data
            read from underlying storage will be verified against
            corresponding checksums.
          @param {Boolean} [options.fill_cache=true] If true, data read from
            disk will be cached in memory.
          @param {Boolean} [options.as_buffer=false] If true, data will be
            returned as a `Buffer`.
        @param {Function} callback The callback function.
          @param {Error} error The error value on error, null otherwise.
          @param {String|Buffer} value If successful, the value.
  */


  Handle.prototype.get = function(key, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    if (!callback) {
      throw new Error('Missing callback');
    }
    if (!Buffer.isBuffer(key)) {
      key = new Buffer(key);
    }
    this.self.get(key, options, function(err, value) {
      if (value && !(options != null ? options.as_buffer : void 0)) {
        value = value.toString('utf8');
      }
      return callback(err, value);
    });
    return this;
  };

  /*
  
        Apply a callback over a range. See `Iterator.forRange()`.
  */


  Handle.prototype.forRange = function() {
    var args, callback, options;
    args = arguments;
    callback = args[args.length - 1];
    if (!callback) {
      throw new Error('Missing callback');
    }
    options = args[args.length - 2];
    if (!(typeof options !== 'object' || Buffer.isBuffer(options))) {
      options = null;
    }
    return this.iterator(options, function(err, it) {
      if (err) {
        return callback(err);
      }
      return it.forRange.apply(it, args);
    });
  };

  /*
  
        Put a key-value pair in the database.
  
        @param {String|Buffer} key The key to put.
        @param {String|Buffer} val The value to put.
        @param {Object} [options] Optional options. See `Handle.write()`.
        @param {Function} [callback] Optional callback.
          @param {Error} error The error value on error, null otherwise.
  */


  Handle.prototype.put = function(key, val, options, callback) {
    this.batch().put(key, val).write(options, callback);
    return this;
  };

  /*
  
        Delete a key-value pair from the database.
  
        @param {String|Buffer} key The key to put.
        @param {Object} [options] Optional options. See `Handle.write()`.
        @param {Function} [callback] Optional callback.
          @param {Error} error The error value on error, null otherwise.
  */


  Handle.prototype.del = function(key, options, callback) {
    this.batch().del(key).write(options, callback);
    return this;
  };

  /*
  
        Commit batch operations to disk.
  
        @param {leveldb.Batch} batch The batch object.
        @param {Object} [options] Optional options. See also the
          `leveldb/options.h` header file.
          @param {Boolean} [options.sync=false] If true, the write will be
            flushed from the operating system buffer cache (by calling
            WritableFile::Sync()) before the write is considered complete. If
            this flag is true, writes will be slower.
        @param {Function} [callback] Optional callback.
          @param {Error} error The error value on error, null otherwise.
  */


  Handle.prototype.write = function(batch, options, callback) {
    if (callback == null) {
      callback = noop;
    }
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    ++batch.readLock_;
    this.self.write(batch.self, options, function(err) {
      --batch.readLock_;
      return callback(err);
    });
    return this;
  };

  /*
  
        Create a new batch object supporting `Batch.write()` using this
        database handle.
  */


  Handle.prototype.batch = function() {
    return new Batch(this.self);
  };

  /*
  
        Create a new iterator.
  
        @param {Object} [options] Optional options. See also the
          `leveldb/options.h` header file.
          @param {Boolean} [options.verify_checksums=false] If true, all data
            read from underlying storage will be verified against
            corresponding checksums.
          @param {Boolean} [options.fill_cache=true] If true, data read from
            disk will be cached in memory.
        @param {Function} callback The callback function.
          @param {Error} error The error value on error, null otherwise.
          @param {leveldb.Iterator} iterator The iterator if successful.
  */


  Handle.prototype.iterator = function(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    if (!callback) {
      throw new Error('Missing callback');
    }
    this.self.iterator(options, function(err, it) {
      var wrap;
      if (!err) {
        wrap = new Iterator(it);
      }
      return callback(err, wrap);
    });
    return this;
  };

  /*
  
        Create a new snapshot.
  
        @param {Function} callback The callback function.
          @param {Error} error The error value on error, null otherwise.
          @param {leveldb.Snapshot} snapshot The snapshot if successful.
  */


  Handle.prototype.snapshot = function(callback) {
    var _this = this;
    if (!callback) {
      throw new Error('Missing callback');
    }
    this.self.snapshot(function(err, snap) {
      var wrap;
      if (!err) {
        wrap = new Snapshot(_this, snap);
      }
      return callback(err, wrap);
    });
    return this;
  };

  /*
  
        Get a database property.
  
        @param {String} name The database property name. See the
          `leveldb/db.h` header file for property names.
        @param {Function} callback The callback function.
          @param {Error} error The error value on error, null otherwise.
          @param {String} value The property value if successful.
  */


  Handle.prototype.property = function(name, callback) {
    if (!callback) {
      throw new Error('Missing callback');
    }
    this.self.property(name, callback);
    return this;
  };

  /*
  
        Approximate the on-disk storage bytes for key ranges.
  
        Usage:
  
          db.approximateSize(['foo', 'bar'], ['baz', 'zee'], callback);
          db.approximateSize([['foo', 'bar'], ['baz', 'zee']], callback);
  
        @param {Array} slices An array of start/limit key ranges.
          @param {String|Buffer} start The start key in the range, inclusive.
          @param {String|Buffer} limit The limit key in the range, exclusive.
        @param {Function} callback The callback function.
          @param {Error} error The error value on error, null otherwise.
          @param {String} value The property value if successful.
  */


  Handle.prototype.approximateSizes = function() {
    var args, callback, limit, slices, start, _i, _len, _ref;
    args = Array.prototype.slice.call(arguments);
    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    }
    if (!callback) {
      throw new Error('Missing callback');
    }
    args = Array.isArray(args[0][0]) ? args[0] : args;
    slices = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      _ref = args[_i], start = _ref[0], limit = _ref[1];
      slices.push(Buffer.isBuffer(start) ? start : Buffer(start));
      slices.push(Buffer.isBuffer(limit) ? limit : Buffer(limit));
    }
    this.self.approximateSizes(slices, callback);
    return this;
  };

  return Handle;

})();

/*

    A Snapshot represents the state of the database when the snapshot was
    created. Get operations return the value of the key when the snapshot
    was created.
*/


Snapshot = (function() {
  /*
  
        Constructor.
  
        @param {leveldb.Handle} self The database handle from which this
          snapshot was created.
        @param {Native} snapshot The native snapshot object.
  */

  function Snapshot(self, snapshot) {
    this.self = self;
    this.snapshot = snapshot;
  }

  /*
  
        Get a value from the database snapshot. See `Handle.get()`.
  */


  Snapshot.prototype.get = function(key, options, callback) {
    if (options == null) {
      options = {};
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options.snapshot = this.snapshot;
    return this.self.get(key, options, callback);
  };

  return Snapshot;

})();
