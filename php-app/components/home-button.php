<div class="home-button-container">
 <button onclick="window.location.href='index.php'" class="home-btn" aria-label="Return to home">
  <i data-lucide="home" class="home-icon"></i>
  Home
 </button>
</div>

<style>
 .home-button-container {
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 1000;
 }

 .home-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
 }

 .home-btn:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
 }

 .home-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
 }

 @media (max-width: 768px) {
  .home-button-container {
   top: 1rem;
   left: 1rem;
  }

  .home-btn {
   padding: 0.625rem 0.875rem;
   font-size: 0.85rem;
  }

  .home-icon {
   width: 16px;
   height: 16px;
  }
 }
</style>