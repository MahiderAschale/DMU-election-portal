const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJtYXIzOTE0MTRAZ21haWwuY29tIiwicm9sZSI6ImVsZWN0aW9uX21hbmFnZXIiLCJyb2xlX2lkIjoyLCJpYXQiOjE3NzcyMzA2NTgsImV4cCI6MTc3NzgzNTQ1OH0.wOy7LcMvtrHmg0PWB3_NUJq3EC1D5AuzH_PtkbmVSUw';

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/voter/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        election_id: 1,
        receiver_role: 'college_dean',
        description: 'test request from debug_request'
      })
    });

    console.log('status', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error(err);
  }
})();
