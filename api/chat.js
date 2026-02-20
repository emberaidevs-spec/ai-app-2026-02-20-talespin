export default async function handler(req, res) {
  try {
    const { method, headers, body } = req;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (method === 'OPTIONS') {
      return res.writeHead(200, corsHeaders).end();
    }

    if (method !== 'POST' || !body || typeof body !== 'object') {
      return res.status(405).json({ error: 'Only POST requests with JSON body are allowed' });
    }

    const { prompt, style } = body;
    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt and style are required' });
    }

    const systemPrompt = `Generate a ${style} story or poem based on the following prompt: ${prompt}. Make it unique and engaging. Do not include any explicit content. The tone should be creative and imaginative.`;
    const messages = [{ role: 'system', content: systemPrompt }];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate story or poem: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ story: aiResponse }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate story or poem' });
  }
}