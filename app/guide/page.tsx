import type { Metadata } from "next";
import { assetPath } from "../asset-path";
import { ChartCacheWarmer } from "./chart-cache-warmer";
import styles from "./guide.module.css";

export const metadata: Metadata = {
  title: "一夕｜30 秒上手",
  description:
    "一夕简明使用说明：选择图谱或典籍，切换外观与版式，保存图片或复制文字。",
};

const steps = [
  {
    number: "01",
    title: "选择内容",
    copy: "先选「图谱」或「典籍」，再点名称打开想看的内容。",
    shotClass: styles.shotChoose,
    shotAlt: "界面上方的图谱、典籍和内容名称选择区",
  },
  {
    number: "02",
    title: "切换外观与版式",
    copy: "右上角可切换「明 / 暗」；一花五叶谱还能选「横幅 / 长卷」。",
    shotClass: styles.shotAppearance,
    shotAlt: "界面上方的明暗与横幅长卷切换按钮",
  },
  {
    number: "03",
    title: "保存图片",
    copy: "点「保存」即可。iPad 在系统菜单选择「存储图像」，电脑会直接下载。",
    shotClass: styles.shotSave,
    shotAlt: "界面上方的保存按钮和版本选择箭头",
  },
  {
    number: "04",
    title: "复制文字",
    copy: "点「复制」，取得当前图谱或典籍的完整文字。",
    shotClass: styles.shotCopy,
    shotAlt: "界面上方的复制按钮",
  },
] as const;

export default function GuidePage() {
  return (
    <main className={styles.page}>
      <ChartCacheWarmer />
      <header className={styles.header}>
        <a className={styles.brand} href={assetPath("/")} aria-label="返回首页">
          <span className={styles.seal} aria-hidden="true">
            一夕
          </span>
          <span>
            <strong>使用说明</strong>
            <small>四步上手</small>
          </span>
        </a>
        <a className={styles.back} href={assetPath("/")}>
          打开
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <article className={styles.content}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>30 秒上手</p>
          <h1>四步看懂，打开就会</h1>
          <p className={styles.lead}>
            先选择想看的图谱或典籍，再按需要切换外观与版式；最后保存图片或复制文字。
          </p>
        </section>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.number}>
              <div className={styles.visualStage}>
                <div
                  className={`${styles.detailShot} ${step.shotClass}`}
                  role="img"
                  aria-label={step.shotAlt}
                  style={{
                    backgroundImage: `url("${assetPath("/guide/interface-desktop.jpg")}")`,
                  }}
                />
              </div>
              <div className={styles.stepBody}>
                <span>{step.number}</span>
                <div>
                  <h2>{step.title}</h2>
                  <p>{step.copy}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className={styles.responsiveNote}>
          <p className={styles.eyebrow}>手机也一样</p>
          <div>
            <h2>四步会自动纵向排列</h2>
            <p>
              查看横幅时可以左右拖动；切成长卷后，顺着页面向下阅读即可。
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>明暗可选，版式可换，图片可存，文字可复制。</p>
          <a href={assetPath("/")}>打开</a>
        </footer>
      </article>
    </main>
  );
}
