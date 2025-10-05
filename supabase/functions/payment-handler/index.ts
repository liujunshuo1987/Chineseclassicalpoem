import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  userId: string;
  planId: string;
  paymentMethod: "wechat" | "alipay";
  amount: number;
}

interface PaymentResponse {
  success: boolean;
  orderId?: string;
  paymentUrl?: string;
  qrCode?: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get payment credentials from environment variables (Supabase Secrets)
    const wechatMerchantId = Deno.env.get("WECHAT_PAY_MERCHANT_ID");
    const wechatApiKey = Deno.env.get("WECHAT_PAY_API_KEY");
    const alipayAppId = Deno.env.get("ALIPAY_APP_ID");
    const alipayPrivateKey = Deno.env.get("ALIPAY_PRIVATE_KEY");

    const { action } = new URL(req.url).searchParams;

    // Handle different actions
    switch (action) {
      case "create-payment": {
        const paymentData: PaymentRequest = await req.json();

        // Validate user authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: "Unauthorized" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Create order record in database
        const orderId = crypto.randomUUID();
        const { error: orderError } = await supabase.from("orders").insert({
          id: orderId,
          user_id: paymentData.userId,
          plan_id: paymentData.planId,
          amount: paymentData.amount,
          payment_method: paymentData.paymentMethod,
          status: "pending",
        });

        if (orderError) {
          return new Response(
            JSON.stringify({ success: false, error: "Failed to create order" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Generate payment based on method
        let paymentResponse: PaymentResponse = { success: true, orderId };

        if (paymentData.paymentMethod === "wechat") {
          // WeChat Pay integration
          if (!wechatMerchantId || !wechatApiKey) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "WeChat Pay not configured",
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          // TODO: Implement actual WeChat Pay API call
          // For now, return a mock QR code URL
          paymentResponse.qrCode = `wechat://pay/${orderId}`;
        } else if (paymentData.paymentMethod === "alipay") {
          // Alipay integration
          if (!alipayAppId || !alipayPrivateKey) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Alipay not configured",
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          // TODO: Implement actual Alipay API call
          // For now, return a mock payment URL
          paymentResponse.paymentUrl = `https://alipay.com/pay/${orderId}`;
        }

        return new Response(JSON.stringify(paymentResponse), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "verify-payment": {
        const { orderId } = await req.json();

        // Query order status
        const { data: order, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .maybeSingle();

        if (error || !order) {
          return new Response(
            JSON.stringify({ success: false, error: "Order not found" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: order.status,
            order,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "webhook": {
        // Handle payment provider webhooks (WeChat/Alipay callbacks)
        const provider = new URL(req.url).searchParams.get("provider");
        const body = await req.text();

        // TODO: Implement webhook verification and processing
        // This would verify the signature and update order status

        console.log(`Received webhook from ${provider}:`, body);

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Payment handler error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
