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
    copy: "「明 / 暗」改变底色；横幅适合电脑、iPad，长卷适合手机。",
    shotClass: styles.shotAppearance,
    shotAlt: "界面上方的明暗与横幅长卷切换按钮",
  },
  {
    number: "03",
    title: "保存图片",
    copy: "点「保存」即可。手机、iPad 在系统菜单选择「存储图像」，电脑会直接下载。",
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
          现在打开
          <span aria-hidden="true">→</span>
        </a>
      </header>

      <article className={styles.content}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>30 秒上手</p>
          <h1>四步看懂，打开就会</h1>
          <p className={styles.lead}>
            首次加载速度较慢，请耐心等待。先选择想看的图谱或典籍，再按需要切换外观与版式；最后保存图片或复制文字。
          </p>
        </section>

        <section className={styles.overview} aria-labelledby="overview-title">
          <div className={styles.overviewHeading}>
            <p className={styles.eyebrow}>先看全貌</p>
            <div>
              <h2 id="overview-title">常用按钮都在页面上方</h2>
              <p>
                先认清按钮位置，再看下面四个局部步骤，使用时就不容易找错。
              </p>
            </div>
          </div>
          <figure className={styles.overviewFigure}>
            <div
              className={styles.overviewDesktopShot}
              role="img"
              aria-label="电脑版图谱页面全貌，内容选择、明暗、版式、保存与复制按钮都位于页面上方"
              style={{
                backgroundImage: `url("${assetPath("/guide/interface-desktop.jpg")}")`,
              }}
            />
            <div
              className={styles.overviewMobileShot}
              role="img"
              aria-label="手机版图谱页面上方全貌，展示内容选择、明暗、版式、保存与复制按钮的位置"
              style={{
                backgroundImage: `url("${assetPath("/guide/interface-mobile.jpg")}")`,
              }}
            />
            <figcaption className={styles.overviewLegend}>
              <span>
                <b>01</b>选择内容
              </span>
              <span>
                <b>02</b>明暗与版式
              </span>
              <span>
                <b>03</b>保存图片
              </span>
              <span>
                <b>04</b>复制文字
              </span>
            </figcaption>
          </figure>
        </section>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.number}>
              <div className={styles.visualStage}>
                {step.number === "02" ? (
                  <div
                    className={styles.appearanceDemo}
                    role="group"
                    aria-label="明暗色调与横幅长卷形状对照"
                  >
                    <div className={styles.comparePanel}>
                      <div className={styles.themeSamples}>
                        <div
                          role="img"
                          aria-label="浅色图谱局部"
                          style={{
                            backgroundImage: `url("${assetPath("/charts/previews/yihua-light-desktop.preview-999fd53db7.jpg")}")`,
                          }}
                        />
                        <div
                          role="img"
                          aria-label="深色图谱局部"
                          style={{
                            backgroundImage: `url("${assetPath("/charts/previews/yihua-dark-desktop.preview-1746e4498f.jpg")}")`,
                          }}
                        />
                      </div>
                      <p>
                        <span>明</span>
                        <i aria-hidden="true">↔</i>
                        <span>暗</span>
                      </p>
                    </div>
                    <div className={styles.comparePanel}>
                      <div className={styles.layoutSamples}>
                        <div
                          className={styles.bannerSample}
                          role="img"
                          aria-label="横幅图谱缩略图"
                          style={{
                            backgroundImage: `url("${assetPath("/charts/previews/yihua-light-desktop.preview-999fd53db7.jpg")}")`,
                          }}
                        />
                        <div
                          className={styles.scrollSample}
                          role="img"
                          aria-label="长卷图谱缩略图"
                          style={{
                            backgroundImage: `url("${assetPath("/charts/previews/yihua-light-mobile.preview-27390eafe2.jpg")}")`,
                          }}
                        />
                      </div>
                      <p>
                        <span>横幅</span>
                        <i aria-hidden="true">↔</i>
                        <span>长卷</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${styles.detailShot} ${step.shotClass}`}
                    role="img"
                    aria-label={step.shotAlt}
                    style={{
                      backgroundImage: `url("${assetPath("/guide/interface-desktop.jpg")}")`,
                    }}
                  />
                )}
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
          <a href={assetPath("/")}>
            现在打开
            <span aria-hidden="true">→</span>
          </a>
        </footer>
      </article>
    </main>
  );
}
