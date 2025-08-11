interface SimpleFetchRequestOptions extends RequestInit {
  validateStatus?: (status: number) => boolean;
}

interface SimpleFetchResponse<R> {
  readonly url: string;
  readonly data: R;
  readonly headers: Headers;
  readonly status: number;
  readonly statusText: string;
}

class SimpleFetchError extends Error {
  constructor(
    public readonly baseURL: string,
    public readonly url: string,
    public readonly response: SimpleFetchResponse<any> | undefined,
  ) {
    super(`Failed to get response from ${new URL(url, baseURL).toString()}`);
    Object.setPrototypeOf(this, SimpleFetchError.prototype);
  }
}

function makeURL(baseURL: string, url: string): string {
  const baseURLInstance = new URL(baseURL);
  baseURL = removeLastSlashIfIs(baseURLInstance.origin);
  url =
    removeLastSlashIfIs(baseURLInstance.pathname) +
    "/" +
    removeFirstSlashIfIs(url);

  url =
    url +
    (() => {
      if (Array.from(baseURLInstance.searchParams.keys()).length > 0) {
        if (url.includes("?")) {
          return "&" + baseURLInstance.searchParams.toString();
        } else {
          return "?" + baseURLInstance.searchParams.toString();
        }
      }
      return "";
    })();

  return removeLastSlashIfIs(baseURL + "/" + removeFirstSlashIfIs(url));
}

function removeFirstSlashIfIs(str: string): string {
  if (str.length > 0 && str[0] === "/") {
    return str.slice(1);
  }

  return str;
}

function removeLastSlashIfIs(str: string): string {
  if (str.length > 0 && str[str.length - 1] === "/") {
    return str.slice(0, str.length - 1);
  }

  return str;
}

export async function simpleFetch<R>(
  baseURL: string,
  url?: string | SimpleFetchRequestOptions,
  options?: SimpleFetchRequestOptions,
): Promise<SimpleFetchResponse<R>> {
  if (typeof url !== "string") {
    if (url) {
      options = url;
    }

    url = "";
  }

  if (url === "/") {
    url = "";
  }
  const actualURL = makeURL(baseURL, url);
  const { headers: optionHeaders, ...otherOptions } = options || {};
  const fetched = await fetch(actualURL, {
    headers: {
      accept: "application/json, text/plain, */*",
      ...optionHeaders,
    },
    ...otherOptions,
  });

  const isGETMethod = (otherOptions?.method || "GET").toUpperCase() === "GET";

  let data: R;

  if (fetched.status === 204) {
    data = undefined as any;
  } else {
    const contentType = fetched.headers.get("content-type") || "";
    if (contentType.startsWith("application/json")) {
      data = await fetched.json();
    } else {
      const r = await fetched.text();
      const trim = r.trim();
      if (trim.startsWith("{") && trim.endsWith("}")) {
        data = JSON.parse(trim);
      } else {
        data = r as any;
      }
    }
  }

  const res = {
    url: actualURL,
    data,
    headers: fetched.headers,
    status: isGETMethod && fetched.status === 204 ? 404 : fetched.status,
    statusText: fetched.statusText,
  };

  const validateStatusFn = options?.validateStatus || defaultValidateStatusFn;
  if (!validateStatusFn(res.status)) {
    throw new SimpleFetchError(baseURL, url, res);
  }

  return res;
}

function defaultValidateStatusFn(status: number): boolean {
  return status >= 200 && status < 300;
}
