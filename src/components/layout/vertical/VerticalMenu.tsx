// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { menuUrls } from '@/@menu/utils/menuUrls'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()

  const verticalNavOptions = useVerticalNav()

  const params = useParams()

  const pathname = usePathname()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const { lang: locale, id, slideId } = params

  const navigationTranslate = dictionary['navigation']

  const keywordsTranslate = dictionary['keywords']

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* Dashboard */}

        <MenuItem
          href={`/${locale}`}
          icon={<i className='ri-dashboard-line text-[20px]' />}
          title={navigationTranslate.dashboard}
        >
          {navigationTranslate.dashboard}
        </MenuItem>

        {/* Product Management */}

        <MenuSection label={navigationTranslate.product_management}>
          <SubMenu label={navigationTranslate.category} icon={<i className='ri-list-unordered text-[20px]' />}>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.category.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.category.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <SubMenu label={navigationTranslate.brand} icon={<i className='ri-price-tag-3-line text-[20px]' />}>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.brand.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.brand.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <SubMenu
            label={navigationTranslate.attribute_attribute_values}
            title={navigationTranslate.attribute_attribute_values}
            icon={<i className='ri-checkbox-line text-[20px]' />}
          >
            <MenuItem
              href={`/${locale}${menuUrls.product_management.attribute.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.attribute.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <MenuItem
            href={`/${locale}${menuUrls.product_management.attributesGroup.list}`}
            icon={<i className='ri-checkbox-multiple-line text-[20px]' />}
            title={navigationTranslate.attribute_groups}
          >
            {navigationTranslate.attribute_groups}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-inbox-line text-[20px]' />}
            title={navigationTranslate.products}
            href={`/${locale}${menuUrls.product_management.products.list}`}
          >
            {navigationTranslate.products}
          </MenuItem>
          <MenuItem
            title={navigationTranslate.pricing_plans}
            icon={<i className='ri-price-tag-2-line text-[20px]' />}
            href={`/${locale}${menuUrls.product_management.pricing_plans.list}`}
          >
            {navigationTranslate.pricing_plans}
          </MenuItem>
          <MenuItem
            href={`/${locale}${menuUrls.product_management.tag.list}`}
            icon={<i className='ri-price-tag-line text-[20px]' />}
            title={navigationTranslate.tags}
          >
            {navigationTranslate.tags}
          </MenuItem>
        </MenuSection>

        {/* Content Management */}

        <MenuSection label={navigationTranslate.content_management}>
          <SubMenu icon={<i className='ri-slideshow-line text-[20px]' />} label={navigationTranslate.slider_management}>
            <MenuItem
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
              href={`/${locale}${menuUrls.content_management.slider.list}`}
            >
              {keywordsTranslate.list}
            </MenuItem>
            {pathname.includes('slides') && pathname.includes('list') && (
              <MenuItem
                icon={<i className='ri-list-unordered text-[20px]' />}
                title={navigationTranslate.slider_slides_list}
                href={`/${locale}${menuUrls.content_management.slider.slides.list.replace(':id', id as string)}`}
              >
                {navigationTranslate.slider_slides_list}
              </MenuItem>
            )}
            {pathname.includes('slides') && pathname.includes('add') && (
              <MenuItem
                icon={<i className='ri-list-unordered text-[20px]' />}
                title={navigationTranslate.slider_slides_add}
                href={`/${locale}${menuUrls.content_management.slider.slides.add.replace(':id', id as string)}`}
              >
                {navigationTranslate.slider_slides_add}
              </MenuItem>
            )}
            {pathname.includes('slides') && pathname.includes('edit') && (
              <MenuItem
                icon={<i className='ri-list-unordered text-[20px]' />}
                title={navigationTranslate.slider_slides_edit}
                href={`/${locale}${menuUrls.content_management.slider.slides.edit.replace(':id', id as string).replace(':slideId', slideId as string)}`}
              >
                {navigationTranslate.slider_slides_edit}
              </MenuItem>
            )}
          </SubMenu>
          <SubMenu icon={<i className='ri-booklet-line text-[20px]' />} label={navigationTranslate.story_management}>
            <MenuItem
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
              href={`/${locale}${menuUrls.content_management.story.list}`}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
              href={`/${locale}${menuUrls.content_management.story.add}`}
            >
              {keywordsTranslate.add}
            </MenuItem>
            {pathname.includes('story') && pathname.includes('edit') && (
              <MenuItem
                icon={<i className='ri-edit-box-line text-[20px]' />}
                title={keywordsTranslate.edit}
                href={`/${locale}${menuUrls.content_management.story.edit.replace(':id', id as string)}`}
              >
                {keywordsTranslate.edit}
              </MenuItem>
            )}
          </SubMenu>
          <SubMenu
            label={navigationTranslate.blog_management}
            icon={<i className='ri-file-text-line text-[20px]' />}
            disabled
          >
            <MenuItem icon={<i className='ri-file-text-line text-[20px]' />} title={navigationTranslate.blog_list}>
              {navigationTranslate.blog_list}
            </MenuItem>
            <MenuItem icon={<i className='ri-list-unordered text-[20px]' />} title={navigationTranslate.blog_category}>
              {navigationTranslate.blog_category}
            </MenuItem>
          </SubMenu>

          <MenuItem
            icon={<i className='ri-question-line text-[20px]' />}
            title={navigationTranslate.faq_management}
            disabled
          >
            {navigationTranslate.faq_management}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-chat-1-line text-[20px]' />}
            title={navigationTranslate.customers_satisfaction_comments_management}
            disabled
          >
            {navigationTranslate.customers_satisfaction_comments_management}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-share-line text-[20px]' />}
            title={navigationTranslate.social_media_management}
            disabled
          >
            {navigationTranslate.social_media_management}
          </MenuItem>
        </MenuSection>

        {/* Users Management */}

        <MenuSection label={navigationTranslate.users_management}>
          <MenuItem
            icon={<i className='ri-lock-line text-[20px]' />}
            title={navigationTranslate.social_media_management}
            disabled
          >
            {navigationTranslate.permissions_management}
          </MenuItem>
          <MenuItem icon={<i className='ri-team-line text-[20px]' />} disabled>
            {navigationTranslate.roles_management}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-team-line text-[20px]' />}
            title={navigationTranslate.user_groups}
            href={`/${locale}${menuUrls.user_management.user_groups.list}`}
          >
            {navigationTranslate.user_groups}
          </MenuItem>
        </MenuSection>

        {/* Orders Management */}

        <MenuSection label={navigationTranslate.orders_management}>
          <MenuItem
            icon={<i className='ri-list-check-2 text-[20px]' />}
            title={navigationTranslate.orders_list}
            disabled
          >
            {navigationTranslate.orders_list}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-arrow-go-back-line text-[20px]' />}
            title={navigationTranslate.refund_order}
            disabled
          >
            {navigationTranslate.refund_order}
          </MenuItem>
        </MenuSection>

        {/* Financial Management */}

        <MenuSection label={navigationTranslate.financial_management}>
          <MenuItem
            icon={<i className='ri-bank-line text-[20px]' />}
            title={navigationTranslate.bank_management}
            disabled
          >
            {navigationTranslate.bank_management}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-currency-line text-[20px]' />}
            title={navigationTranslate.cashier_management}
            disabled
          >
            {navigationTranslate.cashier_management}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-wallet-line text-[20px]' />}
            title={navigationTranslate.users_wallet_management}
            disabled
          >
            {navigationTranslate.users_wallet_management}
          </MenuItem>
          <SubMenu
            icon={<i className='ri-file-text-line text-[20px]' />}
            label={navigationTranslate.invoices_management}
            disabled
          >
            <MenuItem icon={<i className='ri-swap-line text-[20px]' />} title={navigationTranslate.sell}>
              {navigationTranslate.sell}
            </MenuItem>
            <MenuItem icon={<i className='ri-file-copy-line text-[20px]' />} title={navigationTranslate.pre_invoice}>
              {navigationTranslate.pre_invoice}
            </MenuItem>
          </SubMenu>
          <SubMenu
            icon={<i className='ri-money-dollar-circle-line text-[20px]' />}
            label={navigationTranslate.receipts_payments_management}
            title={navigationTranslate.receipts_payments_management}
            disabled
          >
            <MenuItem icon={<i className='ri-receipt-line text-[20px]' />} title={navigationTranslate.payments}>
              {navigationTranslate.payments}
            </MenuItem>
            <MenuItem icon={<i className='ri-receipt-line text-[20px]' />} title={navigationTranslate.receipts}>
              {navigationTranslate.receipts}
            </MenuItem>
          </SubMenu>
          <MenuItem
            icon={<i className='ri-money-dollar-circle-line text-[20px]' />}
            title={navigationTranslate.payment_methods_management}
            disabled
          >
            {navigationTranslate.payment_methods_management}
          </MenuItem>
          <MenuItem
            href={`/${locale}${menuUrls.financial_management.tax.list}`}
            icon={<i className='ri-money-dollar-circle-line text-[20px]' />}
            title={navigationTranslate.taxes_management}
          >
            {navigationTranslate.taxes_management}
          </MenuItem>
          <MenuItem
            href={`/${locale}${menuUrls.financial_management.profit.list}`}
            icon={<i className='ri-money-dollar-circle-line text-[20px]' />}
            title={navigationTranslate.profits_management}
          >
            {navigationTranslate.profits_management}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-truck-line text-[20px]' />}
            title={navigationTranslate.shipping_methods_management}
            disabled
          >
            {navigationTranslate.shipping_methods_management}
          </MenuItem>
        </MenuSection>

        {/* Settings */}

        <MenuSection label={navigationTranslate.settings}>
          <MenuItem icon={<i className='ri-settings-line text-[20px]' />} title={navigationTranslate.settings} disabled>
            {navigationTranslate.settings}
          </MenuItem>
          <MenuItem
            href={`/${locale}${menuUrls.settings.unit.list}`}
            icon={<i className='ri-settings-line text-[20px]' />}
            title={navigationTranslate.units_management}
          >
            {navigationTranslate.units_management}
          </MenuItem>
        </MenuSection>

        {/* Messages Management */}

        <MenuSection label={navigationTranslate.messages_management}>
          <MenuItem
            icon={<i className='ri-feedback-line text-[20px]' />}
            title={navigationTranslate.products_comments_management}
            href={`/${locale}${menuUrls.messages_management.comments.list}`}
          >
            {navigationTranslate.products_comments_management}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-message-3-line text-[20px]' />}
            title={navigationTranslate.customers_messages_management}
            disabled
          >
            {navigationTranslate.customers_messages_management}
          </MenuItem>
          <MenuItem icon={<i className='ri-chat-1-line text-[20px]' />} title={navigationTranslate.chat} disabled>
            {navigationTranslate.chat}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-notification-line text-[20px]' />}
            title={navigationTranslate.notifications}
            disabled
          >
            {navigationTranslate.notifications}
          </MenuItem>
        </MenuSection>

        {/* Reports  */}

        <MenuSection label={navigationTranslate.reports}>
          <MenuItem icon={<i className='ri-user-line text-[20px]' />} title={navigationTranslate.users_report} disabled>
            {navigationTranslate.users_report}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-inbox-line text-[20px]' />}
            title={navigationTranslate.products_report}
            disabled
          >
            {navigationTranslate.products_report}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-file-list-3-line text-[20px]' />}
            title={navigationTranslate.orders_report}
            disabled
          >
            {navigationTranslate.orders_report}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-file-list-3-line text-[20px]' />}
            title={navigationTranslate.app_registeration}
            disabled
          >
            {navigationTranslate.app_registeration}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-file-list-3-line text-[20px]' />}
            title={navigationTranslate.web_registeration}
            disabled
          >
            {navigationTranslate.web_registeration}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-file-chart-line text-[20px]' />}
            title={navigationTranslate.financial_reports}
            disabled
          >
            {navigationTranslate.financial_reports}
          </MenuItem>
        </MenuSection>

        {/* Loyalty Club */}

        <MenuSection label={navigationTranslate.loyalty_club}>
          <MenuItem
            icon={<i className='ri-ticket-line text-[20px]' />}
            title={navigationTranslate.discount_code}
            disabled
          >
            {navigationTranslate.discount_code}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-flag-line text-[20px]' />}
            title={navigationTranslate.sales_campaign_management}
            disabled
          >
            {navigationTranslate.sales_campaign_management}
          </MenuItem>
          <MenuItem icon={<i className='ri-star-line text-[20px]' />} title={navigationTranslate.users_levels} disabled>
            {navigationTranslate.users_levels}
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
