declare namespace Deno {
  function env_get(key: string): string | undefined
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  }
}

export {}
