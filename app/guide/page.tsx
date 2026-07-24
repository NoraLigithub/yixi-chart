import type { Metadata } from "next";
import { assetPath } from "../asset-path";
import { ChartCacheWarmer } from "./chart-cache-warmer";
import styles from "./guide.module.css";

export const metadata: Metadata = {
  title: "一夕｜30 秒上手",
  description:
    "一夕简明使用说明：选择图谱或典籍，切换外观与版式，存到相册或复制文字。",
};

const steps = [
  {
    number: "01",
    title: "选择内容",
    copy: "先选「图谱」或「典籍」，再点名称打开想看的内容。",
    shotClass: styles.shotChoose,
    ringClass: styles.ringChoose,
    shotAlt: "红圈标出的图谱、典籍和内容名称选择区",
  },
  {
    number: "02",
    title: "切换明暗",
    copy: "点右上角「明 / 暗」，就能切换浅色和深色画面。",
    shotClass: styles.shotTheme,
    ringClass: styles.ringTheme,
    shotAlt: "红圈标出的右上角明暗切换按钮",
  },
  {
    number: "03",
    title: "切换版式",
    copy: "默认显示「横幅」，手机和电脑一致；「长卷」适合手机向下阅读。",
    shotClass: styles.shotControls,
    ringClass: styles.ringLayout,
    shotAlt: "红圈标出的横幅和长卷切换按钮",
  },
  {
    number: "04",
    title: "存到相册",
    copy: "点「存到相册」即可。手机、iPad 在系统菜单选择「存储图像」，电脑会直接下载。",
    shotClass: styles.shotControls,
    ringClass: styles.ringSave,
    shotAlt: "红圈标出的存到相册按钮和版本选择箭头",
  },
  {
    number: "05",
    title: "复制文字",
    copy: "点「复制」，取得当前图谱或典籍的完整文字。",
    shotClass: styles.shotControls,
    ringClass: styles.ringCopy,
    shotAlt: "红圈标出的复制按钮",
  },
] as const;

export default function GuidePage() {
  const desktopShot = assetPath("/guide/interface-desktop.jpg");
  const mobileShot = assetPath("/guide/interface-mobile.jpg");

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
            <small>五步上手</small>
          </span>
        </a>
        <a className={styles.back} href={assetPath("/")}>
          现在打开
          <span aria-hidden="true">→</span>
        </a>
      </header>

      <div className={styles.primaryOpenWrap}>
        <a className={styles.primaryOpen} href={assetPath("/")}>
          <span>
            <small>直接进入一夕典藏</small>
            <strong>现在打开图谱与典籍</strong>
          </span>
          <b aria-hidden="true">→</b>
        </a>
      </div>

      <article className={styles.content}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>30 秒上手</p>
          <h1>五步看懂，打开就会</h1>
          <p className={styles.lead}>
            第一次打开请稍等片刻。所有常用按钮都在页面上方，下面用红圈逐个标出位置。
          </p>
        </section>

        <section className={styles.overview} aria-labelledby="overview-title">
          <div className={styles.overviewHeading}>
            <p className={styles.eyebrow}>先看全貌</p>
            <div>
              <h2 id="overview-title">跟着红圈找按钮</h2>
              <p>
                红圈里的编号和下方说明一一对应。手机与电脑的位置相同，只是会自动换行。
              </p>
            </div>
          </div>
          <figure className={styles.overviewFigure}>
            <div className={styles.overviewDesktopFrame}>
              <div
                className={styles.overviewDesktopShot}
                role="img"
                aria-label="电脑版图谱页面全貌，五个红圈分别标出内容选择、明暗、版式、存到相册与复制按钮"
                style={{ backgroundImage: `url("${desktopShot}")` }}
              />
              <span
                className={`${styles.callout} ${styles.desktopCalloutChoose}`}
                aria-hidden="true"
              >
                <b>01 内容</b>
              </span>
              <span
                className={`${styles.callout} ${styles.desktopCalloutTheme}`}
                aria-hidden="true"
              >
                <b>02 明暗</b>
              </span>
              <span
                className={`${styles.callout} ${styles.desktopCalloutLayout}`}
                aria-hidden="true"
              >
                <b>03 版式</b>
              </span>
              <span
                className={`${styles.callout} ${styles.desktopCalloutSave}`}
                aria-hidden="true"
              >
                <b>04 相册</b>
              </span>
              <span
                className={`${styles.callout} ${styles.desktopCalloutCopy}`}
                aria-hidden="true"
              >
                <b>05 复制</b>
              </span>
            </div>
            <div className={styles.overviewMobileFrame}>
              <div
                className={styles.overviewMobileShot}
                role="img"
                aria-label="手机版图谱页面上方全貌，五个红圈分别标出内容选择、明暗、版式、存到相册与复制按钮"
                style={{ backgroundImage: `url("${mobileShot}")` }}
              />
              <span
                className={`${styles.callout} ${styles.mobileCalloutChoose}`}
                aria-hidden="true"
              >
                <b>01 内容</b>
              </span>
              <span
                className={`${styles.callout} ${styles.mobileCalloutTheme}`}
                aria-hidden="true"
              >
                <b>02 明暗</b>
              </span>
              <span
                className={`${styles.callout} ${styles.mobileCalloutLayout}`}
                aria-hidden="true"
              >
                <b>03</b>
              </span>
              <span
                className={`${styles.callout} ${styles.mobileCalloutSave}`}
                aria-hidden="true"
              >
                <b>04</b>
              </span>
              <span
                className={`${styles.callout} ${styles.mobileCalloutCopy}`}
                aria-hidden="true"
              >
                <b>05</b>
              </span>
            </div>
            <figcaption className={styles.overviewLegend}>
              <span>
                <b>01</b>选择内容
              </span>
              <span>
                <b>02</b>切换明暗
              </span>
              <span>
                <b>03</b>切换版式
              </span>
              <span>
                <b>04</b>存到相册
              </span>
              <span>
                <b>05</b>复制文字
              </span>
            </figcaption>
          </figure>
        </section>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.number}>
              <div className={styles.visualStage}>
                <div
                  className={`${styles.detailShot} ${step.shotClass}`}
                  role="img"
                  aria-label={step.shotAlt}
                >
                  <div
                    className={`${styles.detailShotImage} ${styles.detailShotDesktop}`}
                    style={{ backgroundImage: `url("${desktopShot}")` }}
                  />
                  <div
                    className={`${styles.detailShotImage} ${styles.detailShotMobile}`}
                    style={{ backgroundImage: `url("${mobileShot}")` }}
                  />
                  <span
                    className={`${styles.detailRing} ${step.ringClass}`}
                    aria-hidden="true"
                  >
                    <b>{step.title}</b>
                  </span>
                </div>
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
            <h2>五步会自动纵向排列</h2>
            <p>
              查看横幅时可以左右拖动；切成长卷后，顺着页面向下阅读即可。
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>明暗可选，版式可换，图片可存，文字可复制。</p>
          <a href={assetPath("/")}>
            现在打开
            <span aria-hidden="true">→</span>
          </a>
        </footer>
      </article>
    </main>
  );
}
