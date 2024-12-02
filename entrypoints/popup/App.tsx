function App() {
  return (
    <>
      <div>
        <h1 class="text-2xl">Just join!</h1>
        <p>ジョイン可能な状態になると、自動的に自分にインバイトを送信します。</p>
        <div class="stat">
          <div class="stat-figure text-2xl">
            <span>⏳</span>
          </div>
          <div class="stat-title">今の状態</div>
          <div class="stat-value text-primary">待機中...</div>
          <div class="stat-desc">オンラインになるのを待っています</div>
        </div>
      </div>
    </>
  );
}

export default App;
