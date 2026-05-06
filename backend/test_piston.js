
(async () => {
  try {
    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'java',
        version: '15.0.2',
        files: [{ name: 'Main.java', content: 'public class Main { public static void main(String[] args) { System.out.println("Hello"); } }' }],
        stdin: ''
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) { console.error(e); }
})();
