import home from "./home.html";
import { makeBadge } from "./utils";

export interface Env {
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    // MY_KV_NAMESPACE: KVNamespace;
    view_counter: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    // MY_BUCKET: R2Bucket;
}

const handleHome = () => {
    return new Response(home, {
        headers: {
            "Content-Type": "text/html;chartset=utf-8",
        },
    });
};

const handleNotFound = () => {
    return new Response(null, { status: 404 });
};

const handleVisit = async (searchParams: URLSearchParams, env: Env) => {
    const page = searchParams.get("page");
    if (!page) {
        return handleBadRequest();
    }
    const kvPage = await env.view_counter.get(page);
    let value = 1;
    if (kvPage) {
        value = parseInt(kvPage) + 1;
    }
    await env.view_counter.put(page, value + "");
    return new Response(makeBadge(value), {
        headers: { "Content-type": "image/svg+xml;charset=utf-8" },
    });
};

const handleBadRequest = () => {
    return new Response(null, { status: 400 });
};

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const { pathname, searchParams } = new URL(request.url);
        switch (pathname) {
            case "/":
                return handleHome();
            case "/visit":
                return handleVisit(searchParams, env);
            default:
                return handleNotFound();
        }
    },
};
