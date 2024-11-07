

export const showIcon = (x, y, onClick) => {

  // 如果已有图标存在，先移除
  const existingIcon = document.getElementById('custom-selected-icon');
  if (existingIcon) {
    existingIcon.remove();
  }

  // 创建图标
  const icon = document.createElement('div');
  icon.id = 'custom-selected-icon';
  icon.innerHTML = `
    <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_414_83)">
      <rect x="2.68396" y="0.971924" width="40" height="40" rx="16.5199" fill="#F9F9F9"/>
      <rect x="3.18396" y="1.47192" width="39" height="39" rx="16.0199" stroke="url(#paint0_linear_414_83)"/>
      </g>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4798 21.3462C14.4798 16.5446 18.3903 12.648 23.2195 12.648C25.5808 12.648 27.7217 13.579 29.2948 15.0932L30.2459 14.1067C28.4272 12.356 25.9489 11.2782 23.2195 11.2782C17.6379 11.2782 13.1089 15.7834 13.1089 21.3462L14.4798 21.3462Z" fill="#FF3E80"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M17.2568 21.3462C17.2568 17.9685 19.9848 15.2244 23.3573 15.2244C25.0014 15.2244 26.4919 15.8761 27.5891 16.9367L28.5321 15.9432C27.1906 14.6465 25.3658 13.8487 23.3573 13.8487C19.2384 13.8487 15.8935 17.2022 15.8935 21.3462L17.2568 21.3462Z" fill="#FFC300"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M19.8508 21.3462C19.8508 19.509 21.3409 18.0196 23.179 18.0196C24.055 18.0196 24.8506 18.357 25.4454 18.9102L26.39 17.8954C25.5488 17.113 24.4191 16.6335 23.179 16.6335C20.575 16.6335 18.4641 18.7434 18.4641 21.3462L19.8508 21.3462Z" fill="#00D4E6"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M19.9116 21.3462C19.9116 23.1496 21.3735 24.6115 23.1769 24.6115C24.9803 24.6115 26.4422 23.1496 26.4422 21.3462L33.2449 21.3462C33.2449 22.0578 33.1711 22.7522 33.0307 23.4221C32.0739 27.9865 28.0257 31.4142 23.1769 31.4142C18.3281 31.4142 14.2799 27.9865 13.3231 23.4221C13.1827 22.7522 13.1089 22.0578 13.1089 21.3462L19.9116 21.3462ZM15.457 23.4221C16.371 26.8296 19.481 29.3383 23.1769 29.3383C26.8728 29.3383 29.9828 26.8296 30.8968 23.4221L28.0997 23.4221C27.2896 25.3408 25.3905 26.6874 23.1769 26.6874C20.9633 26.6874 19.0642 25.3408 18.2541 23.4221L15.457 23.4221Z" fill="#8759F2"/>
      <defs>
      <filter id="filter0_d_414_83" x="0.68396" y="0.971924" width="44" height="44" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="2"/>
      <feGaussianBlur stdDeviation="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_414_83"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_414_83" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_414_83" x1="22.684" y1="0.971924" x2="22.684" y2="40.9719" gradientUnits="userSpaceOnUse">
      <stop stop-color="white"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
      </linearGradient>
      </defs>
    </svg>`;

  // 设置图标样式
  icon.style.position = 'absolute';
  icon.style.top = `${y}px`;
  icon.style.left = `${x}px`;
  icon.style.cursor = 'pointer';
  icon.style.zIndex = 1000;
  icon.style.width = '100px';
  icon.style.height = '100px';
  icon.style.borderRadius = '50%';
  icon.style.display = 'flex';
  icon.style.alignItems = 'center';
  icon.style.justifyContent = 'center';
  icon.style.pointerEvents = 'auto';

   // 绑定点击事件并确认绑定成功
   icon.addEventListener('click',() => {
    console.log("Icon clicked");
    console.log("onclick is:", onClick); // 查看 onclick 是否存在
    onClick();
    document.body.removeChild(icon);  // 移除图标  
  });

  document.body.appendChild(icon);
  console.log('Icon added to document.');
};

// 移除图标的函数
export const removeIcon = () => {
  const icon = document.getElementById('custom-selected-icon');
  if (icon) {
    icon.remove();
    console.log('Icon removed from document.');
  }
};
