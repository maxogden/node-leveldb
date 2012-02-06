#ifndef NODE_LEVELDB_OPTIONS_H_
#define NODE_LEVELDB_OPTIONS_H_

#include <assert.h>

#include <leveldb/options.h>
#include <node.h>
#include <v8.h>

using namespace node;
using namespace v8;

namespace node_leveldb {

static void UnpackOptions(Handle<Value> val, leveldb::Options& options) {
  HandleScope scope;
  if (!val->IsObject()) return;
  Local<Object> obj = val->ToObject();

  static const Persistent<String> kCreateIfMissing = NODE_PSYMBOL("create_if_missing");
  static const Persistent<String> kErrorIfExists = NODE_PSYMBOL("error_if_exists");
  static const Persistent<String> kParanoidChecks = NODE_PSYMBOL("paranoid_checks");
  static const Persistent<String> kWriteBufferSize = NODE_PSYMBOL("write_buffer_size");
  static const Persistent<String> kMaxOpenFiles = NODE_PSYMBOL("max_open_files");
  static const Persistent<String> kBlockSize = NODE_PSYMBOL("block_size");
  static const Persistent<String> kBlockRestartInterval = NODE_PSYMBOL("block_restart_interval");
  static const Persistent<String> kCompression = NODE_PSYMBOL("compression");
  /*
  static const Persistent<String> kComparator = NODE_PSYMBOL("comparator");
  static const Persistent<String> kInfoLog = NODE_PSYMBOL("info_log");
  */

  if (obj->Has(kCreateIfMissing))
    options.create_if_missing = obj->Get(kCreateIfMissing)->BooleanValue();

  if (obj->Has(kErrorIfExists))
    options.error_if_exists = obj->Get(kErrorIfExists)->BooleanValue();

  if (obj->Has(kParanoidChecks))
    options.paranoid_checks = obj->Get(kParanoidChecks)->BooleanValue();

  if (obj->Has(kWriteBufferSize))
    options.write_buffer_size = obj->Get(kWriteBufferSize)->Int32Value();

  if (obj->Has(kMaxOpenFiles))
    options.max_open_files = obj->Get(kMaxOpenFiles)->Int32Value();

  if (obj->Has(kBlockSize))
    options.block_size = obj->Get(kBlockSize)->Int32Value();

  if (obj->Has(kBlockRestartInterval))
    options.block_restart_interval = obj->Get(kBlockRestartInterval)->Int32Value();

  if (obj->Has(kCompression)) {
    options.compression = obj->Get(kBlockRestartInterval)->BooleanValue()
                        ? leveldb::kSnappyCompression : leveldb::kNoCompression;
  }

  /*
  if (obj->Has(kComparator))
    options.comparator = NULL;

  if (obj->Has(kInfoLog))
    options.info_log = NULL;
  */
}

static void UnpackReadOptions(Handle<Value> val, leveldb::ReadOptions& options, bool& asBuffer) {
  HandleScope scope;
  if (!val->IsObject()) return;
  Local<Object> obj = val->ToObject();

  static const Persistent<String> kSnapshot = NODE_PSYMBOL("snapshot");
  static const Persistent<String> kVerifyChecksums = NODE_PSYMBOL("verify_checksums");
  static const Persistent<String> kFillCache = NODE_PSYMBOL("fill_cache");
  static const Persistent<String> kAsBuffer = NODE_PSYMBOL("as_buffer");

  if (obj->Has(kSnapshot)) {
    Handle<Value> ext = obj->Get(kSnapshot);
    if (ext->IsExternal()) {
      options.snapshot = (leveldb::Snapshot*)External::Unwrap(ext);
    }
  }

  if (obj->Has(kVerifyChecksums))
    options.verify_checksums = obj->Get(kVerifyChecksums)->BooleanValue();

  if (obj->Has(kFillCache))
    options.fill_cache = obj->Get(kFillCache)->BooleanValue();

  if (obj->Has(kAsBuffer))
    asBuffer = obj->Get(kAsBuffer)->ToBoolean()->BooleanValue();

}

static void UnpackWriteOptions(Handle<Value> val, leveldb::WriteOptions& options) {
  if (!val->IsObject()) return;
  Local<Object> obj = val->ToObject();

  static const Persistent<String> kSync = NODE_PSYMBOL("sync");

  if (obj->Has(kSync))
    options.sync = obj->Get(kSync)->BooleanValue();

}

} // namespace node_leveldb

#endif // NODE_LEVELDB_OPTIONS_H_