import { Hourglass } from 'lucide-solid';

function App() {
  return (
    <>
      <div>
        <h1 class="text-2xl">Just join!</h1>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <Hourglass />
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
